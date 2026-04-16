export default function StatusBanner({ status }) {
  const statusConfig = {
    idle: { label: 'Ready to call', color: 'text-neutral-400', icon: 'bg-neutral-500' },
    calling: { label: 'Calling...', color: 'text-amber-400', icon: 'bg-amber-400 animate-pulse-slow' },
    ringing: { label: 'Incoming call', color: 'text-amber-400', icon: 'bg-amber-400 animate-pulse-slow' },
    connecting: { label: 'Connecting...', color: 'text-amber-400', icon: 'bg-amber-400 animate-pulse-slow' },
    connected: { label: 'Connected', color: 'text-emerald-400', icon: 'bg-emerald-400' },
    disconnected: { label: 'Disconnected', color: 'text-rose-400', icon: 'bg-rose-400' },
  };

  const config = statusConfig[status] || statusConfig.idle;

  return (
    <div className={`flex items-center gap-2 ${config.color} text-sm font-medium`}>
      <div className={`w-2 h-2 rounded-full ${config.icon}`} />
      {config.label}
    </div>
  );
}
