import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      // Показываем сообщение о переносе корзины, если оно есть
      if (result.cartMerged && result.mergedItems > 0) {
        setSuccess(result.message);
        // Перенаправляем через 2 секунды, чтобы пользователь успел увидеть сообщение
        setTimeout(() => {
          const returnUrl = searchParams.get('returnUrl');
          navigate(returnUrl || '/');
        }, 2000);
      } else {
        // Обычное перенаправление
        const returnUrl = searchParams.get('returnUrl');
        navigate(returnUrl || '/');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1>Вход</h1>
          
          {searchParams.get('returnUrl') === '/checkout' && (
            <div className="info-message" style={{ 
              backgroundColor: '#e8f5e8', 
              color: '#2e7d32', 
              padding: '1rem', 
              borderRadius: '4px', 
              marginBottom: '1rem',
              border: '1px solid #81c784'
            }}>
              Для оформления заказа необходимо войти в аккаунт.<br/>
              <strong>Не волнуйтесь!</strong> Товары из вашей корзины автоматически перенесутся в аккаунт.
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message" style={{ 
            backgroundColor: '#e8f5e8', 
            color: '#2e7d32', 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1rem',
            border: '1px solid #81c784'
          }}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="auth-link">
            Нет аккаунта? <Link to={`/register${searchParams.get('returnUrl') ? `?returnUrl=${searchParams.get('returnUrl')}` : ''}`}>Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

