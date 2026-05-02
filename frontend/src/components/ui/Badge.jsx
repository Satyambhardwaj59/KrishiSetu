'use client';

const colors = {
  green  : 'bg-green-400/15 text-green-400  border-green-400/30',
  red    : 'bg-red-400/15   text-red-400    border-red-400/30',
  amber  : 'bg-amber-400/15 text-amber-400  border-amber-400/30',
  blue   : 'bg-blue-400/15  text-blue-400   border-blue-400/30',
  purple : 'bg-purple-400/15 text-purple-400 border-purple-400/30',
  slate  : 'bg-slate-600/30 text-slate-300   border-slate-600',
};

const STATUS_COLOR = {
  pending   : 'amber',
  accepted  : 'blue',
  shipped   : 'purple',
  delivered : 'green',
  cancelled : 'red',
  rejected  : 'red',
  paid      : 'green',
  created   : 'amber',
  failed    : 'red',
  released  : 'green',
  verified  : 'green',
  submitted : 'blue',
  disputed  : 'red',
};

export default function Badge({ label, color, status, dot = false, className = '' }) {
  const resolvedColor = color || STATUS_COLOR[status?.toLowerCase()] || 'slate';
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
      border ${colors[resolvedColor]} ${className}
    `}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current`} />}
      {label || status}
    </span>
  );
}
