import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const AdminCategories = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/categories');
      console.log('Categories response:', response);
      
      // axios interceptor возвращает response.data напрямую
      if (response.data?.data) {
        console.log('Setting categories from response.data.data:', response.data.data.length);
        setCategories(response.data.data);
      } else if (Array.isArray(response)) {
        console.log('Setting categories from response array:', response.length);
        setCategories(response);
      } else if (response && Array.isArray(response.data)) {
        console.log('Setting categories from response.data:', response.data.length);
        setCategories(response.data);
      } else {
        console.log('No categories found, setting empty array');
        setCategories([]);
      }
    } catch (err) {
      setError('Ошибка загрузки категорий');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin()) {
      navigate('/login');
      return;
    }
    if (!authLoading) {
      loadCategories();
    }
  }, [authLoading, navigate, isAdmin]);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    // Запрещаем удаление основных категорий
    const protectedCategories = ['beds', 'wardrobes', 'tables'];
    if (protectedCategories.includes(id)) {
      setError('Эту категорию нельзя удалить - она используется в основном меню');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await axios.delete(`/api/admin/categories/${id}`);
      setSuccessMessage('Категория удалена');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadCategories(); // Перезагружаем список
    } catch (err) {
      setError('Ошибка удаления категории');
      console.error(err);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.slug.trim()) {
      setError('Заполните все поля');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      if (editingCategory) {
        // Редактирование существующей категории
        await axios.put(`/api/admin/categories/${editingCategory.id}`, {
          name: formData.name,
          slug: formData.slug
        });
        setSuccessMessage('Категория обновлена');
      } else {
        // Добавление новой категории
        await axios.post('/api/admin/categories', {
          name: formData.name,
          slug: formData.slug
        });
        setSuccessMessage('Категория добавлена');
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '' });
      loadCategories(); // Перезагружаем список
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Ошибка сохранения категории';
      setError(errorMsg);
      console.error('Ошибка сохранения категории:', err.response?.data || err);
      setTimeout(() => setError(''), 5000);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      name,
      slug: editingCategory ? formData.slug : generateSlug(name)
    });
  };

  if (authLoading || loading) {
    return <div className="container" style={{ padding: '4rem 0' }}>Загрузка...</div>;
  }

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Управление категориями</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', slug: '' });
            setShowModal(true);
          }}
        >
          Добавить категорию
        </button>
      </div>

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

      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Название</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Slug</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Статус</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{category.id}</td>
                <td style={{ padding: '1rem' }}>{category.name}</td>
                <td style={{ padding: '1rem' }}>
                  <code style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '3px',
                    fontSize: '0.875rem'
                  }}>
                    {category.slug}
                  </code>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: ['beds', 'wardrobes', 'tables'].includes(category.slug) ? '#007bff' : '#28a745',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    {['beds', 'wardrobes', 'tables'].includes(category.slug) ? 'Основная' : 'Дополнительная'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button
                    onClick={() => handleEdit(category)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      opacity: ['beds', 'wardrobes', 'tables'].includes(category.slug) ? 0.5 : 1
                    }}
                    disabled={['beds', 'wardrobes', 'tables'].includes(category.slug)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            Категории не найдены
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h2>{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Название *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                  URL-адрес категории (например: beds, wardrobes, tables)
                </small>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {editingCategory ? 'Сохранить' : 'Добавить'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', slug: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
