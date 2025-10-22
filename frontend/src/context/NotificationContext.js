import React, { createContext, useContext, useState } from 'react';
import Notification from '../components/common/Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    // Автоматическое удаление через duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message, duration) => addNotification(message, 'success', duration);
  const showError = (message, duration) => addNotification(message, 'error', duration);
  const showInfo = (message, duration) => addNotification(message, 'info', duration);
  const showWarning = (message, duration) => addNotification(message, 'warning', duration);

  return (
    <NotificationContext.Provider value={{
      addNotification,
      removeNotification,
      showSuccess,
      showError,
      showInfo,
      showWarning
    }}>
      {children}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
