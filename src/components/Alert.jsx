import React, { useEffect } from "react";
import "./Alert.css";

const Alert = ({ isOpen, title, message, type = "info", onClose, autoCloseTime = 4000 }) => {
  useEffect(() => {
    if (isOpen && autoCloseTime) {
      const timer = setTimeout(onClose, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseTime, onClose]);

  const handleBackdropClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="alert-overlay" onClick={handleBackdropClick}>
      <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className={`alert-title alert-${type}`}>{title}</h3>
        <p className="alert-message">{message}</p>
        <button className={`alert-button alert-button-${type}`} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default Alert;