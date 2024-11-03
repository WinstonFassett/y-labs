export function Workspace({}: {}) {
  return (
    <div className="h-full flex gap-2 bg-blue-200">
      <FileExplorer />
      <div className="flex-1 bg-content2">
        <FileEditor />
      </div>
    </div>
  );
}

function FileExplorer({}: {}) {
  return <div className="">File Explorer</div>;
}

function FileEditor({}: {}) {
  return <div className="h-full w-full bg-content1">File Editor</div>;
}
