import { useContext, useEffect, useLayoutEffect, useRef } from 'preact/hooks';

import { Terminal } from '@xterm/xterm';
import { WebglAddon } from '@xterm/addon-webgl';

import type { Pty } from './pty-proxy.ts';
import { ModalContext } from './modal.ts';


const te = new TextEncoder();
const td = new TextDecoder();

export const XtermWrapper = ({ pty }: { pty: Pty }) => {
  const modal = useContext(ModalContext);

  const el = useRef<HTMLElement>();

  useLayoutEffect(() => {
    const term = new Terminal({
      cols: 100,
      rows: 30,
      macOptionIsMeta: true,
      scrollback: 0,
      fontFamily: 'Hack Nerd Font',
      theme: {
        foreground: '#E1E3E4',
        background: '#2A2F38',
        cursor: '#E1E3E4',
        cursorAccent: '#2A2F38',
        selectionBackground: '#3D4455',
        black: '#2A2F38',
        red: '#FF6578',
        green: '#9DD274',
        yellow: '#EACB64',
        blue: '#F69C5E',
        magenta: '#BA9CF3',
        cyan: '#72CCE8',
        white: '#E1E3E4',
        brightBlack: '#828A9A',
        brightRed: '#FF6578',
        brightGreen: '#9DD274',
        brightYellow: '#EACB64',
        brightBlue: '#F69C5E',
        brightMagenta: '#BA9CF3',
        brightCyan: '#72CCE8',
        brightWhite: '#E1E3E4',
      },
    });

    const CopyModal = ({ text }: { text: string }) => {
      const copyBtn = useRef<HTMLButtonElement>();

      useEffect(() => {
        copyBtn.current.focus();
      });

      const close = () => {
        term.focus();
        modal.clear();
      };

      const copy = () => navigator.clipboard.writeText(text)
        .then(close)
        .catch(console.error);

      return <div class="m-4 grid gap-2">
        <div class="flex justify-between">
          <button
            class="cursor-pointer hover:underline"
            onClick={close}
          >
            [esc] to close
          </button>

          <button
            class="cursor-pointer hover:underline focus:outline-none"
            onClick={copy}
            ref={copyBtn}
            onKeyDown={({ key }) => {
              if (key === 'Escape') close();
            }}
          >
            [␣] to copy
          </button>
        </div>

        <div>
          <pre class="w-80 h-24 overflow-scroll"><code>{text.substring(0, 200)}</code>{
            text.length > 200
              ?
              <code class="opacity-35">...</code>
              :
              undefined
          }</pre>
        </div>
      </div>;
    };

    term.parser.registerOscHandler(52, (data: string) => {
      const [command, encoded] = data.split(';');
      if (!encoded || command !== 'c') return false;

      const decoded = td.decode(Uint8Array.fromBase64(encoded));
      modal.set(<CopyModal text={decoded} />);
      return true;
    });

    term.loadAddon(new WebglAddon());

    term.onData(str => {
      pty.write(te.encode(str));
    });

    pty.onData(data => {
      term.write(data);
    });

    term.open(el.current);

    term.focus();

    return () => {
      term.dispose();
      pty.close();
    };
  }, []);

  return <main ref={el} class="size-fit rounded overflow-hidden"></main>;
};
