import { useState, useEffect } from 'react';

export default function AudioLevelBar({ audioLevelNode }) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!audioLevelNode) return;

    const data = new Uint8Array(audioLevelNode.frequencyBinCount);

    const updateLevel = () => {
      audioLevelNode.getByteFrequencyData(data);
      const average = data.reduce((a, b) => a + b) / data.length;
      const normalized = Math.min(100, (average / 255) * 100);
      setLevel(normalized);
      requestAnimationFrame(updateLevel);
    };

    const id = requestAnimationFrame(updateLevel);
    return () => cancelAnimationFrame(id);
  }, [audioLevelNode]);

  return (
    <div className="space-y-2">
      <label className="text-xs text-neutral-500">Microphone activity</label>
      <div className="bg-neutral-800 rounded-full h-1 overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-[width] duration-75"
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}
