import axios from './axios';

export const productsAPI = {
  getAllProducts: async (params = {}) => {
    try {
      console.log('🛒 Загружаем товары с параметрами:', params);
      console.log('🌐 Делаем запрос к:', axios.defaults.baseURL + '/api/products');
      const response = await axios.get('/api/products', { params });
      console.log('✅ API ответ получен:', response);
      console.log('📦 Данные товаров:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Ошибка загрузки товаров:', error);
      console.error('❌ Детали ошибки:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getProductBySlug: async (slug) => {
    try {
      const response = await axios.get(`/api/products/${slug}`);
      return response;
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
      throw error;
    }
  },
  
  getFeaturedProducts: async () => {
    try {
      const response = await axios.get('/api/products/featured');
      return response;
    } catch (error) {
      console.error('Ошибка загрузки рекомендуемых товаров:', error);
      throw error;
    }
  },
  
  getSaleProducts: async () => {
    try {
      const response = await axios.get('/api/products/sale');
      return response;
    } catch (error) {
      console.error('Ошибка загрузки товаров со скидкой:', error);
      throw error;
    }
  },
  
  createProduct: (productData) => axios.post('/api/products', productData),
  
  updateProduct: (id, productData) => axios.put(`/api/products/${id}`, productData),
  
  deleteProduct: (id) => axios.delete(`/api/products/${id}`)
};