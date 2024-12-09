import { FastForward, Pause, Play, Rewind } from 'lucide-react';

interface TimelineControlsProps {
  onJumpToSnapshot: (index: number) => void;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  currentIndex: number;
  totalVersions: number;
}

export function TimelineControls({
  onJumpToSnapshot,
  isPlaying = false,
  onPlayPause,
  currentIndex,
  totalVersions,
}: TimelineControlsProps) {
  return (
    <div className="container mx-auto flex items-center gap-3">
      <button
        onClick={() => onJumpToSnapshot(0)}
        disabled={currentIndex === 0}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Go to start"
      >
        <Rewind className="w-5 h-5" />
      </button>

      <button
        onClick={onPlayPause}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title={isPlaying ? 'Pause' : 'Play'}
        disabled={totalVersions <= 1}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>

      <button
        onClick={() => onJumpToSnapshot(totalVersions - 1)}
        disabled={currentIndex >= totalVersions - 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Go to end"
      >
        <FastForward className="w-5 h-5" />
      </button>

      <div className="flex-1 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalVersions - 1)}
          value={currentIndex}
          onChange={(e) => onJumpToSnapshot(parseInt(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        
        <span className="text-sm text-gray-600 tabular-nums min-w-[4rem]">
          {currentIndex + 1} / {totalVersions}
        </span>
      </div>
    </div>
  );
}