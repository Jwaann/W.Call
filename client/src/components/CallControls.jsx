import { useState } from 'react';

export default function CallControls({ onHangUp, onMuteToggle }) {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    onMuteToggle(!isMuted);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleToggleMute}
        className={`flex-1 rounded-full px-4 py-3 font-semibold transition-all active:scale-95 ${
          isMuted
            ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-100'
            : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-100'
        }`}
      >
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <button
        onClick={onHangUp}
        className="flex-1 bg-rose-600 hover:bg-rose-500 active:scale-95 text-neutral-100 rounded-full px-4 py-3 font-semibold transition-all"
      >
        Hang Up
      </button>
    </div>
  );
}
