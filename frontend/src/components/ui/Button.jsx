'use client';
import { Loader2 } from 'lucide-react';

const variants = {
  primary  : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
  outline  : 'border border-slate-600 hover:border-green-500 hover:text-green-400 text-slate-300 bg-transparent',
  danger   : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30',
  ghost    : 'hover:bg-slate-700 text-slate-300',
  amber    : 'bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold shadow-lg shadow-amber-900/30',
  white : 'bg-white hover:bg-slate-100 text-green-700 font-semibold shadow-lg shadow-slate-900/30',
};

const sizes = {
  sm : 'px-3 py-1.5 text-sm',
  md : 'px-5 py-2.5 text-sm',
  lg : 'px-7 py-3.5 text-base',
  xl : 'px-8 py-4 text-lg',
  icon: 'p-2',
};

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  fullWidth= false,
  className= '',
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-all duration-200 focus:outline-none focus:ring-2
        focus:ring-green-500/50 active:scale-[0.98] cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
