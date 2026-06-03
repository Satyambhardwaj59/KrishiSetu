'use client';
import { useSelector } from 'react-redux';
import { Leaf, AlertTriangle, Info, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { fetchAdvisory } from '@/store/slices/weatherSlice';

const TYPE_CONFIG = {
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300' },
  danger : { icon: AlertTriangle, bg: 'bg-red-500/10',   border: 'border-red-500/30',   text: 'text-red-300',   badge: 'bg-red-500/20 text-red-300'   },
  info   : { icon: Info,          bg: 'bg-sky-500/10',   border: 'border-sky-500/30',   text: 'text-sky-300',   badge: 'bg-sky-500/20 text-sky-300'   },
  success: { icon: CheckCircle,   bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-300', badge: 'bg-green-500/20 text-green-300' },
};

export default function CropAdvisoryCard() {
  const dispatch = useDispatch();
  const { advisory, advisoryLoading, activeLocation } = useSelector(s => s.weather);

  const refresh = () => {
    if (activeLocation) dispatch(fetchAdvisory({ lat: activeLocation.lat, lon: activeLocation.lon }));
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-green-500/15 rounded-xl">
            <Leaf size={17} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Crop Advisory</h3>
            <p className="text-xs text-slate-500">AI-powered farming recommendations</p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={advisoryLoading || !activeLocation}
          className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700/60 rounded-lg transition-all disabled:opacity-40"
          title="Refresh advisory"
        >
          <RefreshCw size={15} className={advisoryLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {advisoryLoading ? (
          <div className="flex items-center justify-center gap-2.5 py-8 text-slate-400 text-sm">
            <Loader2 size={18} className="animate-spin text-green-400" />
            Generating advisory…
          </div>
        ) : !advisory ? (
          <div className="text-center py-8">
            <Leaf size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">Select a location to see crop recommendations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Generated timestamp */}
            {advisory.generatedAt && (
              <p className="text-xs text-slate-600 text-right">
                Updated {new Date(advisory.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}

            {(advisory.tips || []).map((tip, idx) => {
              const cfg = TYPE_CONFIG[tip.type] || TYPE_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.border} transition-all hover:scale-[1.01]`}
                >
                  {/* Emoji */}
                  <span className="text-xl shrink-0 mt-0.5">{tip.icon}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className={`text-sm font-semibold ${cfg.text} leading-snug`}>{tip.title}</p>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge} capitalize`}>
                        {tip.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{tip.body}</p>
                  </div>
                </div>
              );
            })}

            {advisory.tips?.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle size={36} className="mx-auto text-green-500 mb-2" />
                <p className="text-sm text-slate-300 font-medium">All Clear!</p>
                <p className="text-xs text-slate-500 mt-1">Weather conditions are favorable for farming activities.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
