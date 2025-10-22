import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container" style={{ padding: '4rem 0', minHeight: '60vh' }}>
      <h1>Профиль</h1>
      <p>Email: {user?.email}</p>
      <p>Имя: {user?.first_name} {user?.last_name}</p>
      <p>Роль: {user?.role}</p>
    </div>
  );
};

export default ProfilePage;

