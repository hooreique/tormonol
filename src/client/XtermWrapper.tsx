import { useContext, useLayoutEffect, useRef } from 'preact/hooks';

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

    term.parser.registerOscHandler(52, (data: string) => {
      const [command, encoded] = data.split(';');
      if (!encoded || command !== 'c') return false;

      const decoded = td.decode(Uint8Array.fromBase64(encoded));
      console.debug('[OSC52] Copy:', decoded);
      console.debug('modal', modal);
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
    };
  }, []);

  return <main ref={el} class="size-fit rounded overflow-hidden"></main>;
};
