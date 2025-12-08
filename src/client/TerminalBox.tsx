import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';

import type { NaturalNumber } from '../natural-number.ts';
import { isNaturalNumber } from '../natural-number.ts';

import type { Pty } from './pty-proxy.ts';
import { withTrace } from './traceable-fetch.ts';
import { ViewportWidthContext } from './viewport-size.tsx';
import { ModalContext } from './modal.ts';
import { XtermWrapper } from './XtermWrapper.tsx';


type Fetch = typeof fetch;

const rand96 = (): Uint8Array<ArrayBuffer> => crypto.getRandomValues(new Uint8Array(12));

const te = new TextEncoder();
const td = new TextDecoder();

const blandSalt = te.encode('bland-salt');
const blandVect = te.encode('bland-vect');

const UP: Readonly<Uint8Array> = te.encode('client -> server');
const DN: Readonly<Uint8Array> = te.encode('server -> client');

export const TerminalBox = () => {
  const modal = useContext(ModalContext);
  const { isSmall } = useContext(ViewportWidthContext);

  const connectButton = useRef<HTMLButtonElement>();

  const [pty, setPty] = useState<Pty | false>(false);
  const [ptyId, setPtyId] = useState<string>('');
  const [prevPtyId, setPrevPtyId] = useState<string>('');
  const healthy = pty && (ptyId !== prevPtyId);

  let mutPtyId = '';
  let mutPrevPtyId = '';

  const disconnect = useRef<() => void>(() => undefined);

  const connect = (pri: ArrayBuffer, fetch: Fetch): Promise<void> => Promise.all([
    fetch('/api/nonce', { method: 'post' }).then(res => {
      if (res.ok) return res.text();
      else throw { message: 'response is not ok' };
    }),
    crypto.subtle.importKey('pkcs8', pri, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']),
  ])
    .then(([nonce, privateKey]) => Promise.all([
      crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, Uint8Array.fromBase64(nonce))
        .then(signature => new Uint8Array(signature).toBase64())
        .then(sig => fetch('/api/ticket', {
          method: 'post',
          body: nonce + '.' + sig,
        }).then(res => {
          if (res.ok) return res.text();
          else throw { message: 'response is not ok' };
        }))
        .then(ticket => ticket.split('.')),
      crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']),
    ]))
    .then(([[id, pub], { privateKey, publicKey }]) => Promise.all([
      crypto.subtle.exportKey('spki', publicKey)
        .then(pub => fetch('/api/salt', {
          method: 'post',
          body: id + '.' + new Uint8Array(pub).toBase64(),
        }))
        .then(res => {
          if (res.ok) return res.text();
          else throw { message: 'response is not ok' };
        })
        .then(str => str.split('.'))
        .then(([id, salt]) => ({ id, salt: Uint8Array.fromBase64(salt) })),
      crypto.subtle.importKey('spki', Uint8Array.fromBase64(pub), { name: 'ECDH', namedCurve: 'P-256' }, false, [])
        .then(pub => crypto.subtle.deriveBits({ name: 'ECDH', public: pub }, privateKey, 256))
        .then(buf => crypto.subtle.importKey('raw', buf, 'HKDF', false, ['deriveKey'])),
    ]))
    .then(([{ id, salt }, key]) => Promise.all([
      crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt, info: UP }, key, { name: 'AES-GCM', length: 128 }, false, ['encrypt']),
      crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt, info: DN }, key, { name: 'AES-GCM', length: 128 }, false, ['decrypt']),
    ])
      .then(([upKey, dnKey]) => [
        (iv: BufferSource, data: BufferSource) => crypto.subtle.encrypt({ name: 'AES-GCM', iv }, upKey, data),
        (iv: BufferSource, data: BufferSource) => crypto.subtle.decrypt({ name: 'AES-GCM', iv }, dnKey, data),
      ])
      .then(([encrypt, decrypt]) => crypto.subtle.importKey('pkcs8', pri, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
        .then(privateKey => crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, Uint8Array.fromBase64(id)))
        .then(signature => new Uint8Array(signature).toBase64())
        .then(sig => {
          const endpoint = new URL('/sockets/' + encodeURIComponent(id), location.origin);
          endpoint.searchParams.set('token', sig);
          endpoint.searchParams.set('dimensions', isSmall ? '40,16' : '100,30');
          const ws = new WebSocket(endpoint);
          ws.binaryType = 'arraybuffer';
          return ws;
        })
        .then(ws => {
          console.debug('connection:', ws);

          const id = ws.url;

          ws.addEventListener('open', () => {
            setPty({
              write: (() => {
                let mutex = Promise.resolve();

                return data => {
                  const iv = rand96();

                  mutex = Promise.all([encrypt(iv, data), mutex])
                    .then(([buf]) => new Uint8Array(buf))
                    .then(src => {
                      const cat = new Uint8Array(1 + 12 + src.length);
                      cat[0] = 0;
                      cat.set(iv, 1);
                      cat.set(src, 13);
                      return cat;
                    })
                    .then(cat => {
                      if (WebSocket.OPEN === ws.readyState) {
                        ws.send(cat);
                      } else {
                        console.debug('could not send (writing to pty): no connection');
                      }
                    })
                    .catch(reason => {
                      console.error('[pty.write]', reason);
                    });
                };
              })(),
              onData: consume => {
                let mutex = Promise.resolve();

                ws.addEventListener('message', ({ data }) => {
                  const cat = new Uint8Array(data as ArrayBuffer);
                  if (cat[0] !== 0) return;

                  mutex = Promise.all([decrypt(cat.subarray(1, 13), cat.subarray(13)), mutex])
                    .then(([buf]) => new Uint8Array(buf))
                    .then(consume)
                    .catch(reason => {
                      console.error('[ws.onMessage]', reason);
                    });
                });
              },
              resize: (cols: NaturalNumber, rows: NaturalNumber) => {
                const data = te.encode(`${cols},${rows}`);
                const cat = new Uint8Array(1 + data.length);
                cat[0] = 1;
                cat.set(data, 1);
                if (WebSocket.OPEN === ws.readyState) {
                  ws.send(cat);
                } else {
                  console.debug('could not send (writing to pty): no connection');
                }
              },
              onResize: adapt => {
                ws.addEventListener('message', ({ data }) => {
                  const cat = new Uint8Array(data as ArrayBuffer);
                  if (cat[0] !== 1) return;

                  const str = td.decode(cat.subarray(1));
                  const [cols, rows, never] = str.split(',').map(Number).filter(isNaturalNumber);

                  if (rows === undefined || never !== undefined) {
                    console.warn(`[ws.onMessage] Bad Resize: ${str}`);
                    return;
                  }

                  adapt(cols, rows);
                });
              },
              close: () => ws.close(4000),
            });

            setPtyId(id);
            mutPtyId = id;

            disconnect.current = () => ws.close(4000);
          });

          ws.addEventListener('close', ({ code, reason }) => {
            setPrevPtyId(id);
            mutPrevPtyId = id;

            if (mutPtyId === mutPrevPtyId) {
              setTimeout(() => connectButton.current?.focus(), 100);
            }

            if (code === 4000) {
              console.debug('connection closed');
            } else if (code === 4001) {
              console.debug('connection closed by pty:', reason);
            } else {
              console.info('connection closed unexpectedly:', code, reason);
            }
          });
        })));

  const enter = (password: string): Promise<ArrayBuffer> => {
    if (!password) {
      return Promise.reject({ message: 'password must not be empty' });
    }

    const encpri = localStorage.getItem('encpri');

    if (!encpri) {
      return Promise.reject({ message: 'encpri not found' });
    }

    return crypto.subtle.importKey('raw', te.encode(password), 'PBKDF2', false, ['deriveKey'])
      .then(key => crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: blandSalt, iterations: 300_000 }, key, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']))
      .then(key => crypto.subtle.decrypt({ name: 'AES-GCM', iv: blandVect }, key, Uint8Array.fromBase64(encpri)))
      .catch(() => {
        throw { message: 'wrong password' };
      });
  };

  const ConnectModal = () => {
    const inputEl = useRef<HTMLInputElement>();

    useEffect(() => {
      inputEl.current?.focus();
    }, []);

    return <div class="mx-4 my-3">
      <div class="text-2xl">
        <input
          ref={inputEl}
          name="code" type="password" autoComplete="off" size={6} maxLength={6}
          class="w-40 focus:outline-none"
          onKeyDown={({ currentTarget, key }) => {
            if (key === 'Enter') {
              enter(currentTarget.value)
                .then(pri => connect(pri, withTrace(fetch)))
                .then(() => {
                  modal.clear();
                })
                .catch(err => {
                  console.error(err);
                  currentTarget.value = '';
                });
            } else if (key === 'Escape') {
              modal.clear();
            }
          }}
        />
      </div>
    </div>;
  };

  useLayoutEffect(() => {
    connectButton.current.focus();
  }, []);

  return <div class="size-fit py-4 grid gap-4">
    <div class="flex justify-between items-center">
      <div>
        {
          healthy
            ?
            <button
              class="cursor-pointer hover:underline"
              onClick={() => {
                disconnect.current();
              }}
            >[<span class="italic">disconnect</span>]</button>
            :
            <button
              ref={connectButton}
              class="cursor-pointer hover:underline focus:outline-none"
              onClick={() => modal.set(<ConnectModal />)}
              onKeyDown={({ key, ctrlKey, altKey, shiftKey }) => {
                if (healthy) return;
                if (ctrlKey || altKey || shiftKey) return;

                if (key === 'c') {
                  modal.set(<ConnectModal />);
                }
              }}
            >
              [
              <span class="italic"><span class="underline">c</span>onnect</span>
              ]
            </button>
        }
      </div>

      <div>
        {
          pty
            ?
            <div class={
              healthy
                ?
                'w-4 h-4 rounded-full bg-[#9DD274]'
                :
                'w-4 h-4 rounded-full bg-[#FF6578]'
            }></div>
            :
            undefined
        }
      </div>
    </div>

    <div class="size-fit">
      {
        pty
          ?
          <XtermWrapper pty={pty} key={ptyId} />
          :
          <main class={
            'rounded overflow-hidden bg-[#2A2F38] flex justify-center items-center'
            +
            (isSmall ? ' w-[360px] h-[288px]' : ' w-[900px] h-[540px]')
          }>
            <nav class="text-[#5A6477] text-center font-bold cursor-default">
              <span class="text-[#828A9A] italic">Tormonol</span>
              <br />
              <span>-</span>
              <br />
              <a href="/build/story.html" class="hover:underline">Story</a>
            </nav>
          </main>
      }
    </div>
  </div>;
};
