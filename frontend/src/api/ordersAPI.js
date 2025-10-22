import axios from './axios';

export const ordersAPI = {
  createOrder: (orderData) => axios.post('/api/orders', orderData),
  
  getUserOrders: (params) => axios.get('/api/orders', { params }),
  
  getOrderById: (id) => axios.get(`/api/orders/${id}`)
};

