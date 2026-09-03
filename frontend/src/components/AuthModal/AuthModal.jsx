import { useState } from 'react';
import axiosInstance from '../../axios'; // Relative path gara src/axios.js sirreeffame

function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin ? { email, password } : { name: username, email, password };

    try {
      const response = await axiosInstance.post(endpoint, payload);

      if (response.data?.token) {
        // Token localstorage keessatti save gochuu
        localStorage.setItem('token', response.data.token);
        
        // Page reload gochuun token haaraa apply gochuu
        window.location.reload();
      }
    } catch (err) {
      console.error('Auth Request Error:', err.response?.data || err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <p className="error-text" style={{ color: 'red' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? 'Sign In' : 'Sign Up'}</button>
        </form>

        <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', marginTop: '10px' }}>
          {isLogin ? "Account hin qabduu? Register godhi" : "Account qabdaa? Login godhi"}
        </p>
      </div>
    </div>
  );
}

export default AuthModal;