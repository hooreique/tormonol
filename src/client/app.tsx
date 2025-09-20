import { render } from 'preact';
import { Layout } from './Layout.tsx';
import { TerminalBox } from './TerminalBox.tsx';


const App = () => <Layout>
  <TerminalBox />
</Layout>;

render(<App />, document.getElementById('app'));
