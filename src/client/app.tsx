import { render } from 'preact';

import { Layout } from './Layout.tsx';
import { TerminalBox } from './TerminalBox.tsx';
import { ViewportWidthContextProvider } from './viewport-size.tsx';


const App = () => <ViewportWidthContextProvider>
  <Layout>
    <TerminalBox />
  </Layout>
</ViewportWidthContextProvider>;

render(<App />, document.getElementById('app'));
