import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartAPI } from '../api/cartAPI';
import './CartPage.css';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await cartAPI.getCart();
      // axios interceptor уже возвращает response.data
      const cartData = response.data || response;
      setCart(cartData);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      setCart({ items: [], totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (id, quantity) => {
    try {
      await cartAPI.updateCartItem(id, quantity);
      loadCart();
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await cartAPI.removeFromCart(id);
      loadCart();
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      // Сохраняем информацию о том, что пользователь хотел оформить заказ
      const confirmRegister = window.confirm(
        'Для оформления заказа необходимо войти в аккаунт или зарегистрироваться.\n\n' +
        'Нажмите "ОК" для регистрации или "Отмена" для входа в существующий аккаунт.'
      );
      
      if (confirmRegister) {
        navigate('/register?returnUrl=/checkout');
      } else {
        navigate('/login?returnUrl=/checkout');
      }
    } else {
      navigate('/checkout');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return <div className="container loading">Загрузка корзины...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="container empty-cart">
        <h1>Корзина пуста</h1>
        <p>Добавьте товары из каталога</p>
        <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Корзина</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <img 
                  src={item.product.main_image || '/images/placeholder.jpg'} 
                  alt={item.product.name}
                  className="cart-item-image"
                />
                
                <div className="cart-item-info">
                  <Link to={`/product/${item.product.slug}`} className="cart-item-name">
                    {item.product.name}
                  </Link>
                  <div className="cart-item-price">
                    {formatPrice(item.product.price)}
                  </div>
                </div>

                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  {formatPrice(item.product.price * item.quantity)}
                </div>

                <button 
                  className="cart-item-remove"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Итого</h3>
            <div className="summary-row">
              <span>Товары ({cart.items.length})</span>
              <span>{formatPrice(cart.totalAmount)}</span>
            </div>
            <div className="summary-row total">
              <span>Итого к оплате:</span>
              <span>{formatPrice(cart.totalAmount)}</span>
            </div>
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleCheckout}
            >
              Оформить заказ
            </button>
            <Link to="/catalog" className="continue-shopping">
              Продолжить покупки
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

