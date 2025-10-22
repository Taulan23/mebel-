import React, { useState } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminParser = () => {
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStartParser = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/parser/start');
      alert(response.message);
    } catch (error) {
      alert('Ошибка запуска парсера');
    }
    setLoading(false);
  };

  if (!isAdmin()) {
    return <div className="container">Доступ запрещен</div>;
  }

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Парсер товаров</h1>
      <button className="btn btn-primary" onClick={handleStartParser} disabled={loading}>
        {loading ? 'Запуск...' : 'Запустить парсер'}
      </button>
      <p style={{ marginTop: '2rem', color: 'var(--color-text-light)' }}>
        Парсер загрузит товары с сайта mebel-moskva.ru
      </p>
    </div>
  );
};

export default AdminParser;

