import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const savedToken = localStorage.getItem('token') || null;

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/register`, payload);
      return data;
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        (Array.isArray(e?.response?.data?.errors) && e.response.data.errors[0]?.msg) ||
        e?.message ||
        'Registration failed';
      console.error('registerUser error:', e?.response?.status, e?.response?.data || e);
      return rejectWithValue(msg);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, payload);
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Login failed');
    }
  }
);

export const bootstrap = createAsyncThunk(
  'auth/bootstrap',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const { data } = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { token, user: data?.user || data };
    } catch (e) {
      localStorage.removeItem('token');
      return rejectWithValue('Session expired');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken,
    user: null,
    loading: false,
    error: '',
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload || {};
      state.token = token || null;
      state.user = user || null;
      if (token) localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = ''; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload?.token || null;
        s.user = a.payload?.user || null;
        if (s.token) localStorage.setItem('token', s.token);
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || 'Registration failed';
      })
      // login
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = ''; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload?.token || null;
        s.user = a.payload?.user || null;
        if (s.token) localStorage.setItem('token', s.token);
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || 'Login failed';
      })
      .addCase(bootstrap.pending, (s) => { s.loading = true; s.error = ''; })
      .addCase(bootstrap.fulfilled, (s, a) => {
        s.loading = false;
        if (a.payload) {
          s.token = a.payload.token || null;
          s.user  = a.payload.user  || null;
        }
      })
      .addCase(bootstrap.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || '';
      });
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
