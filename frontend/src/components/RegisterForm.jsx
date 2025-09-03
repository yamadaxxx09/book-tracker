import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/auth/authSlice';

export function RegisterForm({ onSwitch }) {
  const dispatch = useDispatch();
  const loading = useSelector(s => s.auth.loading);
  const error = useSelector(s => s.auth.error);

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      username: fd.get('username'),
      email: fd.get('email'),
      password: fd.get('password'),
    };
    await dispatch(registerUser(payload));
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '24px auto' }}>
      <h2 className="section-title">Create account</h2>
      <form className="form" onSubmit={handleSubmit}>
        <input className="input" name="username" placeholder="Username" required />
        <input className="input" name="email" type="email" placeholder="Email" required />
        <input className="input" name="password" type="password" placeholder="Password" required />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      {error && <p style={{ color: 'crimson', marginTop: 8 }}>{error}</p>}
      <div className="hr" />
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Already have an account?{' '}
        <button type="button" className="btn btn-ghost" onClick={onSwitch}>
          Sign in
        </button>
      </p>
    </div>
  );
}
