import React, { useState, useEffect } from 'react';
import './Account.css';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../utils/api';
import { SectionHeader, Button } from '../common/CommonComponents';
import { 
  CreditCardIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const Account = () => {
  const { user, login, register, logout, deleteAccount, setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        console.log('Fetching user data for:', user.email);
        try {
          const response = await ApiService.makeAuthRequest('/users/profile');
          console.log('Profile response:', response);
          
          if (response && response.token_balance !== undefined) {
            setUser({
              ...user,
              tokenBalance: response.token_balance, // Map snake_case to camelCase
              id: response.id,
              email: user.email // Preserve the email from the current user object
            });
          }
          
          try {
            const history = await ApiService.makeAuthRequest('/users/tokens/history');
            console.log('Token history response:', history);
            setTokenHistory(history || []);
          } catch (historyError) {
            console.error('Error fetching token history:', historyError);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (error.message === 'Failed to fetch') {
            console.error('Network error - Is the backend server running?');
            setError('Failed to connect to server. Please try again later.');
          } else {
            setError('Failed to load user data');
          }
        }
      }
    };

    fetchUserData();
  }, [user, setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      const userData = await (isLogin ? login(email, password) : register(email, password));
      if (!userData) {
        throw new Error(isLogin ? 'Invalid credentials' : 'Registration failed');
      }

      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Login/Register error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const success = await deleteAccount();
      if (success) {
        setShowDeleteModal(false);
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      setError(error.message);
    }
  };

  const DeleteAccountModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Delete Account</h3>
        <p>
          Are you sure you want to delete your account? This action cannot be undone 
          and you will lose all your remaining tokens and account history.
        </p>
        <div className="modal-actions">
          <button 
            className="modal-button cancel"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </button>
          <button 
            className="modal-button delete"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  if (user) {
    return (
      <div className="account-section">
        <SectionHeader>Account</SectionHeader>
        <div className="auth-container">
          <div className="user-info">
            <p>Logged in as: {user.email}</p>
            <div className="token-balance">
              <CreditCardIcon className="token-icon" />
              <span className="token-amount">
                {user.tokenBalance !== undefined ? `${user.tokenBalance} tokens available` : 'Loading...'}
              </span>
            </div>
            
            {tokenHistory.length > 0 && (
              <div className="token-history">
                <h3>Token History</h3>
                <div className="history-list">
                  {tokenHistory.map((record) => (
                    <div key={record.id} className="history-item">
                      <span className="history-action">{record.action}</span>
                      <span className={`history-amount ${record.amount < 0 ? 'negative' : 'positive'}`}>
                        {record.amount > 0 ? '+' : ''}{record.amount}
                      </span>
                      <span className="history-date">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button onClick={logout}>Logout</Button>
          </div>

          <div className="account-actions">
            <button 
              className="delete-button"
              onClick={() => setShowDeleteModal(true)}
            >
              <TrashIcon className="delete-button-icon" />
              Delete Account
            </button>
          </div>
        </div>

        {showDeleteModal && <DeleteAccountModal />}
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  }

  return (
    <div className="account-section">
      <SectionHeader>{isLogin ? 'Login' : 'Register'}</SectionHeader>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </Button>
        </form>
        <div className="auth-switch">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setIsLogin(false)}>Register</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)}>Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
