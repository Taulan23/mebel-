import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return <div className="container" style={{ padding: '4rem 0' }}>Доступ запрещен</div>;
  }

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Админ-панель</h1>
      <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
        <Link to="/admin/products" className="btn btn-secondary">Управление товарами</Link>
        <Link to="/admin/orders" className="btn btn-secondary">Управление заказами</Link>
        <Link to="/admin/users" className="btn btn-secondary">Управление пользователями</Link>
        <Link to="/admin/categories" className="btn btn-secondary">Управление категориями</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;