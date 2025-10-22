import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api/ordersAPI';
import './OrdersHistoryPage.css';

const OrdersHistoryPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate]);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getUserOrders();
      setOrders(response.data?.data?.items || response.data?.items || []);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (status) => {
    const statuses = {
      pending: 'Ожидает подтверждения',
      confirmed: 'Подтвержден',
      processing: 'В обработке',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    };
    return statuses[status] || status;
  };

  if (loading) {
    return <div className="container loading">Загрузка заказов...</div>;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>История заказов</h1>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>У вас пока нет заказов</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-number">
                    Заказ №{order.order_number}
                  </div>
                  <div className="order-date">
                    {formatDate(order.created_at)}
                  </div>
                </div>

                <div className="order-status">
                  <span className={`status-badge status-${order.status}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="order-items">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <img src={item.product_image} alt={item.product_name} />
                      <div className="order-item-info">
                        <div className="order-item-name">{item.product_name}</div>
                        <div className="order-item-quantity">Количество: {item.quantity}</div>
                      </div>
                      <div className="order-item-price">{formatPrice(item.total)}</div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    Итого: <strong>{formatPrice(order.final_amount)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersHistoryPage;

