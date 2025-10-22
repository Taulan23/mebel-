import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cartAPI } from '../../api/cartAPI';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Проверяем аутентификацию
    if (!isAuthenticated()) {
      alert('Для добавления в корзину необходимо войти в систему');
      navigate('/login');
      return;
    }
    
    try {
      await cartAPI.addToCart(product.id, 1);
      alert('Товар добавлен в корзину!');
    } catch (error) {
      alert('Ошибка добавления в корзину');
    }
  };

  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      <div className="product-card-image">
        <img 
          src={product.main_image || product.images?.[0] || '/images/placeholder.jpg'} 
          alt={product.name}
        />
        {product.is_sale && product.discount_percent > 0 && (
          <span className="product-badge sale">-{product.discount_percent}%</span>
        )}
      </div>

      <div className="product-card-content">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-price">
          {product.old_price && (
            <span className="old-price">{formatPrice(product.old_price)}</span>
          )}
          <span className="current-price">{formatPrice(product.price)}</span>
        </div>

        {product.rating > 0 && (
          <div className="product-rating">
            ⭐ {product.rating.toFixed(1)} ({product.reviews_count})
          </div>
        )}

        <button 
          className="btn btn-primary add-to-cart-btn"
          onClick={handleAddToCart}
        >
          В корзину
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;

