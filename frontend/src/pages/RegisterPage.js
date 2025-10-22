import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '', first_name: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    const result = await register(formData);
    
    if (result.success) {
      // Показываем сообщение о переносе корзины, если оно есть
      if (result.cartMerged && result.mergedItems > 0) {
        setSuccess(result.message);
        // Перенаправляем через 3 секунды, чтобы пользователь успел увидеть сообщение
        setTimeout(() => {
          const returnUrl = searchParams.get('returnUrl');
          navigate(returnUrl || '/');
        }, 3000);
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
          <h1>Регистрация</h1>
          {searchParams.get('returnUrl') === '/checkout' && (
            <div className="info-message" style={{ 
              backgroundColor: '#e8f5e8', 
              color: '#2e7d32', 
              padding: '1rem', 
              borderRadius: '4px', 
              marginBottom: '1rem',
              border: '1px solid #81c784'
            }}>
              Для оформления заказа необходимо создать аккаунт.<br/>
              <strong>Не волнуйтесь!</strong> Товары из вашей корзины автоматически перенесутся в новый аккаунт.
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
              <label>Имя</label>
              <input className="input" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Телефон</label>
              <input className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input type="password" className="input" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              <div className="password-hint" style={{
                fontSize: '0.9rem',
                color: '#666',
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                lineHeight: '1.4'
              }}>
                <strong>Требования к паролю:</strong><br/>
                • Минимум 8 символов<br/>
                • Только латинские буквы (a-z, A-Z)<br/>
                • Обязательно должны быть цифры (0-9)<br/>
                • Можно использовать специальные символы: !@#$%^&*<br/>
                <span style={{color: '#e31e24', fontWeight: 'bold'}}>⚠️ Русские символы не допускаются</span>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          <p className="auth-link">
            Уже есть аккаунт? <Link to={`/login${searchParams.get('returnUrl') ? `?returnUrl=${searchParams.get('returnUrl')}` : ''}`}>Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

