import { EditorProvider } from './EditorProvider';
import EditorContainer from './EditorContainer';
import './index.css';
import { useDocEditor } from '../shared/useDocEditor';

function App() {
  initialize()
  return (
    <EditorProvider>
      {/* <div className="app"> */}
        {/* <Sidebar /> */}
        {/* <div className="main-content"> */}
          {/* <TopBar /> */}
          <EditorContainer />
        {/* </div> */}
      {/* </div> */}
    </EditorProvider>
  );
}

export default App;

function initialize() {
  console.log('initializing')
}