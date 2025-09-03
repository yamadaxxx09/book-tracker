import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBooks } from './features/books/booksSlice'
import { logout } from './features/auth/authSlice'
import LoginForm from './components/LoginForm'
import BookList from './components/BookList'
import AddBookForm from './components/AddBookForm'

export default function App() {
  const dispatch = useDispatch()
  const token = useSelector(s => s.auth.token)
  const status = useSelector(s => s.books.status)
  const user = useSelector(s => s.auth.user)

  useEffect(() => {
    if (token) dispatch(fetchBooks(token))
  }, [token, dispatch])

  if (!token) return <LoginForm />

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1>📚 Book Tracker</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user?.username && <span style={{ fontSize: 14, color: '#555' }}>Hello, {user.username}</span>}
          <button onClick={() => dispatch(logout())}>Logout</button>
        </div>
      </header>

      <AddBookForm />
      <hr style={{ margin: '16px 0' }} />
      {status === 'loading' ? <p>Loading...</p> : <BookList />}
    </div>
  )
}

