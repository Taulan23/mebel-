import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../api/productsAPI';
import './ProductPage.css';

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      const response = await productsAPI.getProductBySlug(slug);
      setProduct(response.data);
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) return <div className="container loading">Загрузка...</div>;
  if (!product) return <div className="container">Товар не найден</div>;

  return (
    <div className="product-page">
      <div className="container">
        <div className="product-back-button">
          <button onClick={goBack} className="back-button">
            ← Назад к каталогу
          </button>
        </div>
        <div className="product-layout">
          <div className="product-gallery">
            <img src={product.main_image || '/images/placeholder.jpg'} alt={product.name} className="main-image" />
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>
            <div className="product-price-section">
              {product.old_price && <span className="old-price">{formatPrice(product.old_price)}</span>}
              <span className="current-price">{formatPrice(product.price)}</span>
            </div>

            <button className="btn btn-primary btn-lg add-to-cart">
              Добавить в корзину
            </button>

            <div className="product-description">
              <h3>Описание</h3>
              <p>{product.description || 'Описание отсутствует'}</p>
            </div>

            {product.attributes && product.attributes.length > 0 && (
              <div className="product-attributes">
                <h3>Характеристики</h3>
                <table>
                  <tbody>
                    {product.attributes.map((attr, index) => (
                      <tr key={index}>
                        <td>{attr.attribute_name}</td>
                        <td>{attr.attribute_value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

