import React, { useEffect } from "react";
import "./Alert.css";

const Alert = ({ 
  isOpen, 
  title, 
  message, 
  type = "info", 
  onClose, 
  onConfirm,
  autoCloseTime = 4000,
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}) => {
  useEffect(() => {
    if (isOpen && autoCloseTime && !onConfirm) {
      const timer = setTimeout(onClose, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseTime, onConfirm, onClose]);

  const handleBackdropClick = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="alert-overlay" onClick={handleBackdropClick}>
      <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className={`alert-title alert-${type}`}>{title}</h3>
        <p className="alert-message">{message}</p>
        <div className="alert-buttons">
          {onConfirm ? (
            <>
              <button 
                className="alert-button alert-button-cancel" 
                onClick={onClose}
              >
                {cancelText}
              </button>
              <button 
                className="alert-button alert-button-confirm" 
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button className={`alert-button alert-button-${type}`} onClick={onClose}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;