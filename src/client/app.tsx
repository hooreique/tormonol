import { render } from 'preact';

import { mutex } from '../mutex.ts';

import { Layout } from './Layout.tsx';
import { TerminalBox } from './TerminalBox.tsx';
import { ViewportWidthContextProvider } from './viewport-size.tsx';


const App = () => <ViewportWidthContextProvider>
  <Layout>
    <TerminalBox bellMutex={mutex()} />
  </Layout>
</ViewportWidthContextProvider>;

render(<App />, document.getElementById('app'));
