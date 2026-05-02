'use client';

export default function Input({
  label,
  error,
  hint,
  icon: Icon,
  rightElement,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={18} />
          </span>
        )}
        <input
          {...props}
          className={`
            w-full bg-slate-800 border rounded-xl px-4 py-3 text-sm text-slate-100
            placeholder-slate-500 transition-all duration-200 outline-none
            focus:border-green-500 focus:ring-2 focus:ring-green-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-700'}
            ${Icon ? 'pl-10' : ''}
            ${className}
          `}
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
