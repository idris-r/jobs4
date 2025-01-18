import React from 'react';
    import './Modal.css';

    const Modal = ({ isOpen, onClose, title, children, onProceed }) => {
      if (!isOpen) return null;

      return (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{title}</h3>
            {children}
            <div className="modal-actions">
              <button 
                className="modal-button cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                className="modal-button proceed"
                onClick={onProceed}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      );
    };

    export default Modal;
