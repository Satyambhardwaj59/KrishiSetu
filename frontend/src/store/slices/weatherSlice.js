import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchWeather = createAsyncThunk('weather/fetchWeather', async ({ lat, lon }, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/weather', { params: { lat, lon } });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const fetchAdvisory = createAsyncThunk('weather/fetchAdvisory', async ({ lat, lon }, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/weather/advisory', { params: { lat, lon } });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const searchLocations = createAsyncThunk('weather/searchLocations', async (q, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/weather/search', { params: { q } });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const reverseGeocode = createAsyncThunk('weather/reverseGeocode', async ({ lat, lon }, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/weather/reverse', { params: { lat, lon } });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const fetchSavedLocations = createAsyncThunk('weather/fetchSaved', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/weather/saved');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const saveLocation = createAsyncThunk('weather/saveLocation', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/weather/saved', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const deleteSavedLocation = createAsyncThunk('weather/deleteLocation', async (index, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/weather/saved/${index}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    // Current active location
    activeLocation : null,     // { name, lat, lon, display }
    locationLoading: false,

    // Weather data
    weatherData    : null,
    weatherLoading : false,
    weatherError   : null,

    // Advisory
    advisory       : null,
    advisoryLoading: false,

    // Location search
    searchResults  : [],
    searchLoading  : false,

    // Saved locations
    savedLocations : [],
    savedLoading   : false,

    // UI
    activeTab      : 'current',   // 'current' | 'forecast' | 'hourly' | 'advisory'
  },
  reducers: {
    setActiveLocation: (state, action) => {
      state.activeLocation = action.payload;
      state.weatherData    = null;
      state.weatherError   = null;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    clearSearch: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWeather
      .addCase(fetchWeather.pending,   (s) => { s.weatherLoading = true;  s.weatherError = null; })
      .addCase(fetchWeather.fulfilled, (s, a) => { s.weatherLoading = false; s.weatherData = a.payload; })
      .addCase(fetchWeather.rejected,  (s, a) => { s.weatherLoading = false; s.weatherError = a.payload?.message; })

      // fetchAdvisory
      .addCase(fetchAdvisory.pending,   (s) => { s.advisoryLoading = true; })
      .addCase(fetchAdvisory.fulfilled, (s, a) => { s.advisoryLoading = false; s.advisory = a.payload; })
      .addCase(fetchAdvisory.rejected,  (s) => { s.advisoryLoading = false; })

      // searchLocations
      .addCase(searchLocations.pending,   (s) => { s.searchLoading = true; })
      .addCase(searchLocations.fulfilled, (s, a) => { s.searchLoading = false; s.searchResults = a.payload; })
      .addCase(searchLocations.rejected,  (s) => { s.searchLoading = false; s.searchResults = []; })

      // reverseGeocode
      .addCase(reverseGeocode.pending,   (s) => { s.locationLoading = true; })
      .addCase(reverseGeocode.fulfilled, (s, a) => {
        s.locationLoading = false;
        if (s.activeLocation) s.activeLocation.display = a.payload.display;
      })
      .addCase(reverseGeocode.rejected, (s) => { s.locationLoading = false; })

      // saved locations
      .addCase(fetchSavedLocations.fulfilled, (s, a) => { s.savedLocations = a.payload || []; })
      .addCase(saveLocation.fulfilled,        (s, a) => { s.savedLocations = a.payload || []; })
      .addCase(deleteSavedLocation.fulfilled, (s, a) => { s.savedLocations = a.payload || []; });
  },
});

export const { setActiveLocation, setActiveTab, clearSearch } = weatherSlice.actions;
export default weatherSlice.reducer;
