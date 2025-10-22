import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--color-primary)' }}>404</h1>
      <h2>Страница не найдена</h2>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>На главную</Link>
    </div>
  );
};

export default NotFoundPage;

