import { createSlice } from '@reduxjs/toolkit'

const token = localStorage.getItem('token')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    user: null
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload
      state.token = token
      state.user = user
      localStorage.setItem('token', token)
    },
    logout: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
    }
  }
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
