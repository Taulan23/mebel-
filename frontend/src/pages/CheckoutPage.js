import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartAPI } from '../api/cartAPI';
import { ordersAPI } from '../api/ordersAPI';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: user?.first_name || '',
    customer_phone: user?.phone || '',
    customer_email: user?.email || '',
    delivery_address: '',
    customer_comment: '',
    delivery_method: 'delivery',
    delivery_direction: '',
    payment_method: 'cash'
  });

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    if (!isAuthenticated()) {
      const confirmRegister = window.confirm(
        'Для оформления заказа необходимо войти в аккаунт или зарегистрироваться.\n\n' +
        'Нажмите "ОК" для регистрации или "Отмена" для входа в существующий аккаунт.'
      );
      
      if (confirmRegister) {
        navigate('/register?returnUrl=/checkout');
      } else {
        navigate('/login?returnUrl=/checkout');
      }
      return;
    }
    loadCart();
  }, [isAuthenticated, navigate]);

  const loadCart = async () => {
    try {
      const response = await cartAPI.getCart();
      // axios interceptor уже возвращает response.data
      const cartData = response.data || response;
      setCart(cartData);
      if (cartData.items && cartData.items.length === 0) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      navigate('/cart');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      const response = await ordersAPI.createOrder(orderData);
      
      if (response.data?.success) {
        alert('Заказ успешно оформлен! Номер заказа: ' + response.data.data.order_number);
        navigate('/orders');
      }
    } catch (error) {
      alert('Ошибка оформления заказа: ' + (error.response?.data?.message || error.message));
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

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Оформление заказа</h1>

        <div className="checkout-layout">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h3>Контактные данные</h3>
              <div className="form-group">
                <label>Имя *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Телефон *</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Доставка</h3>
              <div className="form-group">
                <label>
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked={formData.delivery_method === 'delivery'}
                    onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
                  />
                  <span>Доставка курьером</span>
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={formData.delivery_method === 'pickup'}
                    onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
                  />
                  <span>Самовывоз</span>
                </label>
              </div>
              {formData.delivery_method === 'delivery' && (
                <>
                  <div className="form-group">
                    <label>Направление доставки *</label>
                    <select
                      className="input"
                      value={formData.delivery_direction}
                      onChange={(e) => setFormData({ ...formData, delivery_direction: e.target.value })}
                      required
                    >
                      <option value="">Выберите направление</option>
                      <option value="center">Центр города</option>
                      <option value="north">Север</option>
                      <option value="south">Юг</option>
                      <option value="east">Восток</option>
                      <option value="west">Запад</option>
                      <option value="suburbs">Пригород</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Адрес доставки *</label>
                    <textarea
                      className="input"
                      rows="3"
                      value={formData.delivery_address}
                      onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <div className="form-section">
              <h3>Способ оплаты</h3>
              <div className="form-group">
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={formData.payment_method === 'cash'}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  />
                  <span>Наличными при получении</span>
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={formData.payment_method === 'card'}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  />
                  <span>Картой при получении</span>
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={formData.payment_method === 'online'}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  />
                  <span>Онлайн оплата</span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label>Комментарий к заказу</label>
                <textarea
                  className="input"
                  rows="4"
                  value={formData.customer_comment}
                  onChange={(e) => setFormData({ ...formData, customer_comment: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Оформление...' : 'Оформить заказ'}
            </button>
          </form>

          <div className="order-summary">
            <h3>Ваш заказ</h3>
            <div className="order-items">
              {cart.items.map((item) => (
                <div key={item.id} className="order-item">
                  <img src={item.product.main_image} alt={item.product.name} />
                  <div className="order-item-info">
                    <div className="order-item-name">{item.product.name}</div>
                    <div className="order-item-quantity">× {item.quantity}</div>
                  </div>
                  <div className="order-item-price">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>Итого:</span>
              <span>{formatPrice(cart.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

