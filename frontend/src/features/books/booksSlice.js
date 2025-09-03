import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

function authHeaders(getState) {
  const token = getState().auth.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const fetchBooks = createAsyncThunk(
  'books/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/books`, {
        headers: { ...authHeaders(getState) },
      });
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'fetch failed');
    }
  }
);

export const addBook = createAsyncThunk(
  'books/add',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/api/books`, payload, {
        headers: { 'Content-Type': 'application/json', ...authHeaders(getState) },
      });
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'add failed');
    }
  }
);

export const updateBook = createAsyncThunk(
  'books/update',
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_BASE}/api/books/${id}`, updates, {
        headers: { 'Content-Type': 'application/json', ...authHeaders(getState) },
      });
      return data;
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'update failed';
      return rejectWithValue(msg);
    }
  }
);

export const deleteBook = createAsyncThunk(
  'books/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/api/books/${id}`, {
        headers: { ...authHeaders(getState) },
      });
      return id;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'delete failed');
    }
  }
);

const slice = createSlice({
  name: 'books',
  initialState: { items: [], loading: false, error: '' },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchBooks.pending,   (s)    => { s.loading = true; s.error = ''; });
    b.addCase(fetchBooks.fulfilled, (s, a) => { s.loading = false; s.items = a.payload || []; });
    b.addCase(fetchBooks.rejected,  (s, a) => { s.loading = false; s.error = a.payload || 'fetch failed'; });

    b.addCase(addBook.pending,      (s)    => { s.error = ''; });
    b.addCase(addBook.fulfilled,    (s, a) => { s.items.unshift(a.payload); });
    b.addCase(addBook.rejected,     (s, a) => { s.error = a.payload || 'add failed'; });

    b.addCase(updateBook.fulfilled, (s, a) => {
      const i = s.items.findIndex(x => x._id === a.payload._id);
      if (i >= 0) s.items[i] = a.payload;
    });
    b.addCase(updateBook.rejected,  (s, a) => { s.error = a.payload || 'update failed'; });

    b.addCase(deleteBook.fulfilled, (s, a) => {
      s.items = s.items.filter(x => x._id !== a.payload);
    });
    b.addCase(deleteBook.rejected,  (s, a) => { s.error = a.payload || 'delete failed'; });

    b.addMatcher(
      (a) => a.type.startsWith('books/') && a.type.endsWith('/pending'),
      (s) => { s.error = ''; }
    );
  },
});

export default slice.reducer;
