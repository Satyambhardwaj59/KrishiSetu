'use client';

export default function Card({ children, className = '', hover = false, glass = false, padding = true }) {
  return (
    <div className={`
      rounded-2xl border border-slate-700/60
      ${glass ? 'bg-slate-800/60 backdrop-blur-md' : 'bg-slate-800'}
      ${hover  ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 cursor-pointer' : ''}
      ${padding ? 'p-6' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, trend, color = 'green' }) {
  const colorMap = {
    green : 'text-green-400 bg-green-400/10',
    amber : 'text-amber-400 bg-amber-400/10',
    blue  : 'text-blue-400 bg-blue-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
    red   : 'text-red-400 bg-red-400/10',
  };
  return (
    <Card hover className="flex items-center gap-4">
      {Icon && (
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon size={24} className={`text-${color}-400`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-400 truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
          </p>
        )}
      </div>
    </Card>
  );
}
