import EditorContainer from './EditorContainer';
import { EditorProvider } from './EditorProvider';
import './index.css';

function App() {
  return (
    <EditorProvider>
      <EditorContainer />
    </EditorProvider>
  );
}

export default App;