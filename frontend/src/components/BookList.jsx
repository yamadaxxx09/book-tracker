import { useDispatch, useSelector } from 'react-redux'
import { deleteBook, updateBook } from '../features/books/booksSlice'
import { useState } from 'react'

export default function BookList() {
  const dispatch = useDispatch()
  const token = useSelector(s => s.auth.token)
  const items = useSelector(s => s.books.items)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', author: '', genre: '', rating: 3, notes: '' })

  const startEdit = (book) => {
    setEditingId(book._id)
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      rating: book.rating,
      notes: book.notes
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ title: '', author: '', genre: '', rating: 3, notes: '' })
  }

  const saveEdit = (id) => {
    dispatch(updateBook({ id, updates: form, token }))
    setEditingId(null)
  }

  const onDelete = (id) => {
    if (!confirm('Delete this book?')) return
    dispatch(deleteBook({ id, token }))
  }

  if (!items.length) return <p>No books yet. Add your first one!</p>

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map(b => (
        <div key={b._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
          {editingId === b._id ? (
            <div style={{ display: 'grid', gap: 6 }}>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
              <input value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} />
              <input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => saveEdit(b._id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{b.title}</strong>
                <div style={{ fontSize: 14, color: '#444' }}>
                  {b.author && <> by {b.author}</>} {b.genre && <> · {b.genre}</>}
                </div>
                <div style={{ fontSize: 14 }}>Rating: {b.rating ?? '-'}</div>
                {b.notes && <div style={{ marginTop: 6 }}>{b.notes}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => startEdit(b)}>Edit</button>
                <button onClick={() => onDelete(b._id)}>Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
