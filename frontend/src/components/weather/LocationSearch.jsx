'use client';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, MapPin, Bookmark, BookmarkCheck, X, Loader2, Navigation } from 'lucide-react';
import {
  searchLocations, clearSearch, setActiveLocation,
  fetchWeather, fetchAdvisory, saveLocation, deleteSavedLocation, fetchSavedLocations,
} from '@/store/slices/weatherSlice';
import toast from 'react-hot-toast';

export default function LocationSearch({ onGpsRequest }) {
  const dispatch = useDispatch();
  const { searchResults, searchLoading, savedLocations, activeLocation } = useSelector(s => s.weather);
  const { isAuthenticated } = useSelector(s => s.auth);

  const [query, setQuery]     = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  // Fetch saved locations on mount
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchSavedLocations());
  }, [isAuthenticated, dispatch]);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        dispatch(searchLocations(val.trim()));
        setShowDrop(true);
      }, 350);
    } else {
      dispatch(clearSearch());
      setShowDrop(false);
    }
  };

  const selectLocation = (loc) => {
    dispatch(setActiveLocation({ name: loc.name, lat: loc.lat, lon: loc.lon, display: loc.display }));
    dispatch(fetchWeather({ lat: loc.lat, lon: loc.lon }));
    dispatch(fetchAdvisory({ lat: loc.lat, lon: loc.lon }));
    setQuery(loc.display);
    setShowDrop(false);
    dispatch(clearSearch());
  };

  const handleSave = async (loc, e) => {
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Login to save locations'); return; }
    try {
      await dispatch(saveLocation({ name: loc.name, lat: loc.lat, lon: loc.lon, country: loc.country })).unwrap();
      toast.success(`${loc.name} saved!`);
    } catch (err) {
      toast.error(err?.message || 'Could not save location');
    }
  };

  const handleDeleteSaved = async (index) => {
    try {
      await dispatch(deleteSavedLocation(index)).unwrap();
      toast.success('Location removed');
    } catch { toast.error('Failed to remove'); }
  };

  const isSaved = (loc) =>
    savedLocations.some(s => Math.abs(s.lat - loc.lat) < 0.01 && Math.abs(s.lon - loc.lon) < 0.01);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (!e.target.closest('#weather-search-box')) setShowDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="w-full space-y-3">
      {/* Search Input */}
      <div id="weather-search-box" className="relative">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleInput}
            onFocus={() => searchResults.length && setShowDrop(true)}
            placeholder="Search city, village, district..."
            id="weather-location-search"
            className="w-full bg-slate-800/80 border border-slate-600/60 rounded-xl pl-10 pr-24 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/70 focus:ring-1 focus:ring-sky-500/30 transition-all"
          />
          {/* GPS button */}
          <button
            onClick={onGpsRequest}
            id="weather-gps-btn"
            title="Use my location"
            className="absolute right-2 flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          >
            <Navigation size={13} />
            GPS
          </button>
          {/* Clear */}
          {query && (
            <button
              onClick={() => { setQuery(''); dispatch(clearSearch()); setShowDrop(false); }}
              className="absolute right-[4.5rem] text-slate-500 hover:text-slate-300 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDrop && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-800 border border-slate-600/60 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
            {searchLoading ? (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-slate-400">
                <Loader2 size={15} className="animate-spin" /> Searching…
              </div>
            ) : searchResults.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">No results found</p>
            ) : (
              searchResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => selectLocation(loc)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-700/70 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin size={14} className="text-sky-400 shrink-0" />
                    <span className="text-sm text-slate-200 truncate">{loc.display}</span>
                  </div>
                  <button
                    onClick={(e) => handleSave(loc, e)}
                    title={isSaved(loc) ? 'Already saved' : 'Save location'}
                    className="shrink-0 p-1 text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    {isSaved(loc) ? <BookmarkCheck size={15} className="text-amber-400" /> : <Bookmark size={15} />}
                  </button>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Saved Locations */}
      {isAuthenticated && savedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {savedLocations.map((loc, idx) => (
            <div
              key={idx}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border
                ${activeLocation?.name === loc.name
                  ? 'bg-sky-600/30 border-sky-500/60 text-sky-300'
                  : 'bg-slate-700/60 border-slate-600/50 text-slate-300 hover:border-sky-500/40 hover:text-sky-300'
                }`}
              onClick={() => selectLocation({ ...loc, display: `${loc.name}, ${loc.country}` })}
            >
              <Bookmark size={11} className="text-amber-400" />
              {loc.name}
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteSaved(idx); }}
                className="ml-0.5 text-slate-500 hover:text-red-400 hidden group-hover:inline transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
