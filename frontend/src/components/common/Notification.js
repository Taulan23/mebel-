import React, { useEffect, useState } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Ждем завершения анимации
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`notification notification-${type} ${isVisible ? 'notification-visible' : ''}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {type === 'success' && '✅'}
          {type === 'error' && '❌'}
          {type === 'info' && 'ℹ️'}
          {type === 'warning' && '⚠️'}
        </div>
        <div className="notification-message">{message}</div>
        <button className="notification-close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;
