export default function DialPad({ remotePeerId, onRemotePeerIdChange, onCall }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onCall();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
        Peer ID to Call
      </label>
      <input
        type="text"
        value={remotePeerId}
        onChange={(e) => onRemotePeerIdChange(e.target.value)}
        placeholder="Paste peer ID here"
        className="w-full bg-neutral-800 border border-neutral-700 focus:border-indigo-500 focus:outline-none rounded-lg px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 transition-colors"
      />
      <button
        type="submit"
        disabled={!remotePeerId.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-700 disabled:text-neutral-500 active:scale-95 text-neutral-100 rounded-full px-4 py-3 font-semibold transition-all"
      >
        Call
      </button>
    </form>
  );
}
