import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addBook } from '../features/books/booksSlice'

export default function AddBookForm() {
  const dispatch = useDispatch()
  const token = useSelector(s => s.auth.token)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [rating, setRating] = useState(3)
  const [notes, setNotes] = useState('')
  const [err, setErr] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!title.trim()) {
      setErr('Title is required')
      return
    }
    try {
      await dispatch(addBook({ book: { title, author, genre, rating: Number(rating), notes }, token })).unwrap()
      setTitle(''); setAuthor(''); setGenre(''); setRating(3); setNotes('')
    } catch (e) {
      setErr(e.message || 'failed to add')
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
      <h3>Add Book</h3>
      <input placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} />
      <input placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} />
      <input placeholder="Genre" value={genre} onChange={e => setGenre(e.target.value)} />
      <input type="number" min="1" max="5" placeholder="Rating (1-5)" value={rating} onChange={e => setRating(e.target.value)} />
      <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
      <button type="submit">Add</button>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
    </form>
  )
}
