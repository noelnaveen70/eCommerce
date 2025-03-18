import React, { useEffect } from 'react';
import styles from './Snackbar.module.css';

const Snackbar = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.snackbar} ${styles[type]}`}>
      {message}
    </div>
  );
};

export default Snackbar; 