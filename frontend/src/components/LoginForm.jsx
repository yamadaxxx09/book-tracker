import { useState } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/auth/authSlice'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function LoginForm() {
  const dispatch = useDispatch()
  const [mode, setMode] = useState('login') 
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      if (mode === 'register') {
        const res = await axios.post(`${API_BASE}/api/auth/register`, { username, email, password })
        dispatch(setCredentials(res.data))
      } else {
        const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password })
        dispatch(setCredentials(res.data))
      }
    } catch (e) {
      setErr(e.response?.data?.error || e.message)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>{mode === 'register' ? 'Create Account' : 'Login'}</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        {mode === 'register' && (
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">{mode === 'register' ? 'Register' : 'Login'}</button>
      </form>
      {err && <p style={{ color: 'crimson', marginTop: 8 }}>{err}</p>}
      <p style={{ marginTop: 12 }}>
        {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button onClick={() => setMode(mode === 'register' ? 'login' : 'register')} type="button">
          {mode === 'register' ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  )
}
