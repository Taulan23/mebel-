import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const AdminOrders = () => {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin()) {
      navigate('/login');
      return;
    }
    if (!authLoading) {
      loadOrders();
    }
  }, [authLoading, navigate, isAdmin]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/orders');
      
      // Поддержка разных форматов ответа
      let ordersData = [];
      console.log('Orders response:', response);
      console.log('response.data:', response.data);
      console.log('response.data.data:', response.data?.data);
      console.log('response.data.data.orders:', response.data?.data?.orders);
      
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data?.items) {
        ordersData = response.data.items;
      } else if (response.data?.orders && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (response.data?.data?.orders && Array.isArray(response.data.data.orders)) {
        ordersData = response.data.data.orders;
      }
      
      console.log('Final ordersData:', ordersData);
      setOrders(ordersData);
    } catch (err) {
      setError('Ошибка загрузки заказов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      setSuccessMessage('Статус заказа обновлён');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadOrders();
    } catch (err) {
      setError('Ошибка обновления статуса');
      console.error(err);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await axios.get(`/api/admin/orders/${orderId}`);
      setSelectedOrder(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      setError('Ошибка загрузки деталей заказа');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'processing': '#17a2b8',
      'shipped': '#007bff',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Ожидает',
      'processing': 'В обработке',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменён'
    };
    return texts[status] || status;
  };

  if (authLoading || loading) {
    return <div className="container" style={{ padding: '4rem 0' }}>Загрузка...</div>;
  }

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Управление заказами</h1>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '4px',
          marginTop: '1rem',
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
          marginTop: '1rem',
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
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>№ Заказа</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Клиент</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Сумма</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Статус</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Дата</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>#{order.id}</td>
                  <td style={{ padding: '1rem' }}>
                    {order.user ? `${order.user.first_name} ${order.user.last_name}` : order.customer_name || 'Неизвестно'}
                    <br />
                    <small style={{ color: '#666' }}>{order.customer_email || order.email}</small>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{order.total_amount} ₽</td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: getStatusColor(order.status),
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Ожидает</option>
                      <option value="processing">В обработке</option>
                      <option value="shipped">Отправлен</option>
                      <option value="delivered">Доставлен</option>
                      <option value="cancelled">Отменён</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleViewDetails(order.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Подробнее
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              Заказы не найдены
            </div>
          )}
      </div>

      {/* Модальное окно с деталями заказа */}
      {showDetailsModal && selectedOrder && (
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
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2>Заказ #{selectedOrder.id}</h2>
            
            <div style={{ marginTop: '1.5rem' }}>
              <h3>Информация о клиенте:</h3>
              <p><strong>Имя:</strong> {selectedOrder.customer_name}</p>
              <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
              <p><strong>Телефон:</strong> {selectedOrder.customer_phone}</p>
              <p><strong>Адрес доставки:</strong> {selectedOrder.delivery_address}</p>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h3>Товары:</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Товар</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Цена</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Кол-во</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.75rem' }}>{item.product_name}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{parseFloat(item.price).toLocaleString('ru-RU')} ₽</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{parseFloat(item.total).toLocaleString('ru-RU')} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <h3>Итого: {parseFloat(selectedOrder.final_amount).toLocaleString('ru-RU')} ₽</h3>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <p><strong>Статус:</strong> <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: getStatusColor(selectedOrder.status),
                color: '#fff',
                borderRadius: '4px'
              }}>{getStatusText(selectedOrder.status)}</span></p>
              <p><strong>Способ оплаты:</strong> {selectedOrder.payment_method}</p>
              {selectedOrder.comment && (
                <p><strong>Комментарий:</strong> {selectedOrder.comment}</p>
              )}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedOrder(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
