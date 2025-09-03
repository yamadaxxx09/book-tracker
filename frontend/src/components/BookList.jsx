
import { useDispatch, useSelector } from 'react-redux';
import { deleteBook, updateBook } from '../features/books/booksSlice';
import { useState } from 'react';

export function BookList() {
  const dispatch = useDispatch();
  const books = useSelector(s => s.books.items ?? []);
  const error  = useSelector(s => s.books.error);
  const loading = useSelector(s => s.books.loading);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    rating: '',
    notes: '',
  });

  const startEdit = (b) => {
    setEditingId(b._id);
    setForm({
      title:  b.title  ?? '',
      author: b.author ?? '',
      genre:  b.genre  ?? '',
      rating: b.rating ?? '',
      notes:  b.notes  ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    const title = form.title.trim();
    if (!title) {
      alert('Title is required');
      return;
    }
    try {
      await dispatch(
        updateBook({
          id: editingId,
          updates: {
            title,
            author: form.author?.trim() || '',
            genre:  form.genre?.trim()  || '',
            rating: form.rating || '',
            notes:  form.notes?.trim()  || '',
          },
        })
      ).unwrap();
      setEditingId(null);
    } catch (e) {
      console.error('update failed:', e);
      alert(`Update failed: ${e}`);
    }
  };

  const onDelete = (id) => dispatch(deleteBook(id));

  return (
    <div className="card">
      <h3 className="section-title">Your Books</h3>
      {error && <p style={{ color:'crimson' }}>{error}</p>}
      <div className="book-list">
        {books.map(b => {
          const isEditing = editingId === b._id;
          return (
            <div key={b._id} className="book-item">
              <div className="book-top">
                <div style={{ flex: 1, minWidth: 0 }}>
                  {!isEditing ? (
                    <>
                      <div className="book-title">{b.title}</div>
                      <div className="meta">
                        {b.author && <span>by {b.author}</span>}
                        {b.genre  && <span className="badge">{b.genre}</span>}
                        {b.rating && <span className="badge">★ {b.rating}</span>}
                      </div>
                    </>
                  ) : (
                    <div className="edit-fields" style={{ display: 'grid', gap: 8 }}>
                      <input
                        className="input"
                        placeholder="Title"
                        value={form.title}
                        onChange={e => setForm(v => ({ ...v, title: e.target.value }))}
                      />
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <input
                          className="input"
                          style={{ flex: 1, minWidth: 140 }}
                          placeholder="Author"
                          value={form.author}
                          onChange={e => setForm(v => ({ ...v, author: e.target.value }))}
                        />
                        <input
                          className="input"
                          style={{ flex: 1, minWidth: 120 }}
                          placeholder="Genre"
                          value={form.genre}
                          onChange={e => setForm(v => ({ ...v, genre: e.target.value }))}
                        />
                        <input
                          className="input"
                          style={{ width: 120 }}
                          placeholder="Rating"
                          value={form.rating}
                          onChange={e => setForm(v => ({ ...v, rating: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display:'flex', gap:8 }}>
                  {!isEditing ? (
                    <>
                      <button className="btn btn-ghost" onClick={() => startEdit(b)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => onDelete(b._id)}>Delete</button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn"
                        onClick={saveEdit}
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                    </>
                  )}
                </div>
              </div>

              {!isEditing ? (
                b.notes && <div style={{ color:'var(--muted)' }}>{b.notes}</div>
              ) : (
                <textarea
                  className="input"
                  placeholder="Notes"
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(v => ({ ...v, notes: e.target.value }))}
                  style={{ marginTop: 8 }}
                />
              )}

              <div className="hr" />
            </div>
          );
        })}
        {books.length === 0 && (
          <p style={{ color:'var(--muted)', margin:'8px 0 0' }}>No books yet.</p>
        )}
      </div>
    </div>
  );
}
