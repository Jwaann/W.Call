import { useState } from 'react';

export default function PeerIdDisplay({ peerId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
        Your Peer ID
      </label>
      <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3">
        <code className="flex-1 font-mono text-sm tracking-widest text-neutral-100 break-all">
          {peerId}
        </code>
        <button
          onClick={handleCopy}
          className="text-neutral-400 hover:text-neutral-200 transition-colors"
          title="Copy peer ID"
        >
          {copied ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
      {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
    </div>
  );
}
