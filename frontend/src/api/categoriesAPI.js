import axios from './axios';

export const categoriesAPI = {
  getAllCategories: async () => {
    try {
      console.log('Загружаем категории...');
      const response = await axios.get('/api/categories');
      console.log('API категории получены:', response);
      return response;
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      throw error;
    }
  },
  
  getCategoryBySlug: async (slug) => {
    try {
      const response = await axios.get(`/api/categories/${slug}`);
      return response;
    } catch (error) {
      console.error('Ошибка загрузки категории:', error);
      throw error;
    }
  },
  
  createCategory: (categoryData) => axios.post('/api/categories', categoryData),
  
  updateCategory: (id, categoryData) => axios.put(`/api/categories/${id}`, categoryData),
  
  deleteCategory: (id) => axios.delete(`/api/categories/${id}`)
};