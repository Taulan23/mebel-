import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const AdminUsers = () => {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin()) {
      navigate('/login');
      return;
    }
    if (!authLoading) {
      loadUsers();
    }
  }, [authLoading, navigate, isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      // axios interceptor возвращает response.data, а API возвращает массив напрямую
      console.log('Users response:', response);
      if (Array.isArray(response)) {
        setUsers(response);
      } else if (response && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError('Ошибка загрузки пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}/status`, {
        is_active: !currentStatus
      });
      setSuccessMessage('Статус пользователя обновлён');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadUsers();
    } catch (err) {
      setError('Ошибка обновления статуса');
      console.error(err);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, {
        role: newRole
      });
      setSuccessMessage('Роль пользователя обновлена');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadUsers();
    } catch (err) {
      setError('Ошибка обновления роли');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setSuccessMessage('Пользователь удалён');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadUsers();
    } catch (err) {
      setError('Ошибка удаления пользователя');
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return <div className="container" style={{ padding: '4rem 0' }}>Загрузка...</div>;
  }

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Управление пользователями</h1>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#efe', 
          color: '#0a0', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {successMessage}
        </div>
      )}

      <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Имя</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Телефон</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Роль</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Статус</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Дата регистрации</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{user.id}</td>
                <td style={{ padding: '1rem' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>
                  {user.first_name} {user.last_name}
                </td>
                <td style={{ padding: '1rem' }}>{user.phone || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: user.role === 'admin' ? '#fff3cd' : '#fff'
                    }}
                  >
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                  </select>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: user.is_active ? '#28a745' : '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {user.is_active ? 'Активен' : 'Заблокирован'}
                  </button>
                </td>
                <td style={{ padding: '1rem' }}>
                  {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            Пользователи не найдены
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

