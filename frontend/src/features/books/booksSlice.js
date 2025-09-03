import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/books'

export const fetchBooks = createAsyncThunk('books/fetchBooks', async (token) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
})

export const addBook = createAsyncThunk('books/addBook', async ({ book, token }) => {
  const res = await axios.post(API_URL, book, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
})

export const deleteBook = createAsyncThunk('books/deleteBook', async ({ id, token }) => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return id 
})

export const updateBook = createAsyncThunk('books/updateBook', async ({ id, updates, token }) => {
  const res = await axios.put(`${API_URL}/${id}`, updates, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
})

const booksSlice = createSlice({
  name: 'books',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        const id = action.payload
        state.items = state.items.filter(b => b._id !== id)
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b._id === action.payload._id)
        if (idx !== -1) {
          state.items[idx] = action.payload
        }
      })
  }
})

export default booksSlice.reducer
