import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addBook } from '../features/books/booksSlice';

export function AddBookForm() {
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get('title')?.trim(),
      author: fd.get('author') || '',
      genre: fd.get('genre') || '',
      rating: fd.get('rating') ? Number(fd.get('rating')) : null,
      notes: fd.get('notes') || '',
    };

    if (!payload.title) return;

    try {
      setSubmitting(true);
      const res = await dispatch(addBook(payload));
      if (res.error) {
        console.error(res.error);
      } else {
        e.currentTarget.reset();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 className="section-title">Add a Book</h3>
      <form className="form" onSubmit={handleSubmit}>
        <input className="input" name="title" placeholder="Title *" required />
        <input className="input" name="author" placeholder="Author" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 140px', gap:12 }}>
          <input className="input" name="genre" placeholder="Genre" />
          <select className="select" name="rating" defaultValue="">
            <option value="" disabled>Rating</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <textarea className="textarea" name="notes" rows={3} placeholder="Notes" />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
