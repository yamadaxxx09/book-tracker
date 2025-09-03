import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from './features/books/booksSlice';
import { logout } from './features/auth/authSlice';
import { AddBookForm } from './components/AddBookForm.jsx';
import { BookList } from './components/BookList.jsx';
import { LoginForm } from './components/LoginForm.jsx';
import { RegisterForm } from './components/RegisterForm.jsx'; 

export default function App() {
  const user = useSelector(s => s.auth.user);
  const dispatch = useDispatch();
  const [authMode, setAuthMode] = useState('login'); 

  useEffect(() => {
    if (user) dispatch(fetchBooks());
  }, [user, dispatch]);

  const handleLogout = () => dispatch(logout());

  return (
    <>
      <header className="app-header">
        <div className="nav container">
          <div className="brand">
            <span className="brand-badge" />
            <span>Book Tracker</span>
          </div>
          <div className="actions">
            {user && (
              <button className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 16 }}>
        {user ? (
          <>
            <AddBookForm />
            <BookList />
          </>
        ) : authMode === 'login' ? (
          <LoginForm onSwitch={(mode = 'register') => setAuthMode(mode)} />
        ) : (
          <RegisterForm onSwitch={() => setAuthMode('login')} />
        )}
      </main>
    </>
  );
}
