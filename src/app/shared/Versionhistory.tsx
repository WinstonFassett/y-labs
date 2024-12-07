import { Clock } from 'lucide-react';
import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { useDocParams } from '../blocknote/Editor';
import { Alert } from '@/components/ui/alert';
import { getDocVersionsStoreById } from './store/doc-versions';
import { useStore } from '@nanostores/react';

interface VersionHistoryProps {
  versions: Y.Array<any>;
  currentIndex: number;
  onVersionSelect: (index: number) => void;
}

export function VersionHistory() {
  const { docId } = useDocParams();
  const versionHistoryStore = getDocVersionsStoreById(docId)
  const {displayVersionId } =  useStore(versionHistoryStore);
  const versions = useStore(versionHistoryStore.$versions);
  function onVersionSelect(versionKey: string) {
    versionHistoryStore.setKey('displayVersionId', versionKey)
  }
  // const { versions, currentIndex, onVersionSelect }: VersionHistoryProps = {}
  const versionArray = Array.from(versions).reverse();
  const selectedRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [displayVersionId]);
  if (!docId) return (
    <Alert variant="destructive">
      <p>No document selected</p>
    </Alert>
  )
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      <div className="shrink-0 flex items-center gap-2 p-4 border-b">
        <Clock className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold">Version History</h2>
        <p>docId: {docId}</p>
      </div>
      
      <div className="overflow-y-auto flex-1 p-4 space-y-2">
        {versionArray.length === 0 ? (
          <p className="text-gray-500 text-sm">No versions yet</p>
        ) : (
          versionArray.map((version, idx) => {
            // const originalIndex = versions.length - 1 - idx;
            const versionKey = version.id
            return (
              <button
                key={versionKey}
                ref={versionKey === displayVersionId ? selectedRef : null}
                onClick={() => onVersionSelect(versionKey)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  versionKey === displayVersionId
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    Version {versionKey}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(version.date).toLocaleTimeString()}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}