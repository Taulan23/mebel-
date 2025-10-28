import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const AdminProducts = () => {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    old_price: '',
    description: '',
    category_id: '',
    in_stock: true,
    stock_quantity: 0,
    is_new: false,
    is_featured: false,
    is_sale: false,
    discount_percent: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAdmin()) {
      navigate('/login');
      return;
    }
    if (!authLoading) {
      loadProducts();
      loadCategories();
    }
  }, [authLoading, navigate, isAdmin]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/products');
      console.log('Admin products response:', response);
      console.log('response.data:', response.data);
      console.log('response.data.data:', response.data?.data);
      console.log('response.data.data.products:', response.data?.data?.products);
      
      // axios interceptor возвращает response.data напрямую
      if (response.data?.data?.products) {
        console.log('Setting products from response.data.data.products:', response.data.data.products.length);
        setProducts(response.data.data.products);
      } else if (response.data?.products) {
        console.log('Setting products from response.data.products:', response.data.products.length);
        setProducts(response.data.products);
      } else if (response.data?.items) {
        console.log('Setting products from response.data.items:', response.data.items.length);
        setProducts(response.data.items);
      } else if (Array.isArray(response.data)) {
        console.log('Setting products from response.data array:', response.data.length);
        setProducts(response.data);
      } else {
        console.log('No products found, setting empty array');
        setProducts([]);
      }
    } catch (err) {
      setError('Ошибка загрузки товаров');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/admin/categories');
      console.log('Categories response:', response);
      
      if (response.data?.data) {
        setCategories(response.data.data);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else if (response && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
      setCategories([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/products/${id}`);
      setSuccessMessage('Товар удалён');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadProducts();
    } catch (err) {
      setError('Ошибка удаления товара');
      console.error(err);
    }
  };

  const handleEdit = async (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      old_price: product.old_price || '',
      description: product.description || '',
      category_id: product.category_id || '',
      in_stock: product.in_stock,
      stock_quantity: product.stock_quantity,
      is_new: product.is_new || false,
      is_featured: product.is_featured || false,
      is_sale: product.is_sale || false,
      discount_percent: product.discount_percent || 0
    });
    setImageFile(null);
    setImagePreview(product.main_image ? `http://localhost:5000${product.main_image}` : null);
    // Обновляем категории перед открытием формы редактирования
    await loadCategories();
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Form data before processing:', formData);
      
      // Создаём FormData для отправки файла
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('in_stock', formData.in_stock);
      formDataToSend.append('stock_quantity', parseInt(formData.stock_quantity) || 0);
      
      // Всегда добавляем все поля, даже если они пустые
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('old_price', formData.old_price ? parseFloat(formData.old_price) : '');
      
      // Добавляем категорию
      if (formData.category_id) {
        formDataToSend.append('category_id', parseInt(formData.category_id));
      }

      // Добавляем статусы товара
      formDataToSend.append('is_new', formData.is_new || false);
      formDataToSend.append('is_featured', formData.is_featured || false);
      formDataToSend.append('is_sale', formData.is_sale || false);
      
      // Добавляем скидку если товар в распродаже
      if (formData.is_sale && formData.discount_percent) {
        formDataToSend.append('discount_percent', parseInt(formData.discount_percent));
      }
      
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, ':', value);
      }

      // Добавляем файл изображения, если выбран
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingProduct) {
        await axios.put(`/api/admin/products/${editingProduct.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccessMessage('Товар обновлён');
      } else {
        await axios.post('/api/admin/products', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccessMessage('Товар добавлен');
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        old_price: '',
        description: '',
        category_id: '',
        in_stock: true,
        stock_quantity: 0
      });
      setImageFile(null);
      setImagePreview(null);
      loadProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Ошибка сохранения товара';
      setError(errorMsg);
      console.error('Ошибка сохранения товара:', err.response?.data || err);
      setTimeout(() => setError(''), 5000);
    }
  };

  if (authLoading || loading) {
    return <div className="container" style={{ padding: '4rem 0' }}>Загрузка...</div>;
  }

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <h1>Управление товарами</h1>
        <button 
          className="btn btn-primary"
          onClick={async () => {
            setEditingProduct(null);
            setFormData({
              name: '',
              price: '',
              old_price: '',
              description: '',
              category_id: '',
              in_stock: true,
              stock_quantity: 0,
              is_new: false,
              is_featured: false,
              is_sale: false,
              discount_percent: 0
            });
            setImageFile(null);
            setImagePreview(null);
            // Обновляем категории перед открытием формы
            await loadCategories();
            setShowModal(true);
          }}
        >
          Добавить товар
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

      {loading ? (
        <div>Загрузка...</div>
      ) : (
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
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Цена</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Старая цена</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>В наличии</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Количество</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{product.id}</td>
                  <td style={{ padding: '1rem' }}>{product.name}</td>
                  <td style={{ padding: '1rem' }}>{product.price} ₽</td>
                  <td style={{ padding: '1rem' }}>{product.old_price ? `${product.old_price} ₽` : '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: product.in_stock ? '#28a745' : '#dc3545',
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}>
                      {product.in_stock ? 'Да' : 'Нет'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{product.stock_quantity}</td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleEdit(product)}
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
                      onClick={() => handleDelete(product.id)}
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

          {products.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              Товары не найдены
            </div>
          )}
        </div>
      )}

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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2>{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Название *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Цена *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Старая цена</label>
                <input
                  type="number"
                  value={formData.old_price}
                  onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>


              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Категория</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Изображение товара</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                {imagePreview && (
                  <div style={{ marginTop: '1rem' }}>
                    <img 
                      src={imagePreview} 
                      alt="Предпросмотр" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }} 
                    />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Количество на складе</label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  В наличии
                </label>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Новинка
                </label>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Рекомендуемые
                </label>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_sale}
                    onChange={(e) => setFormData({ ...formData, is_sale: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Распродажа
                </label>
              </div>

              {formData.is_sale && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Процент скидки</label>
                  <input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    min="0"
                    max="100"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    placeholder="Введите процент скидки (0-100)"
                  />
                </div>
              )}

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
                  {editingProduct ? 'Сохранить' : 'Добавить'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
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

export default AdminProducts;
