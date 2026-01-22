import React from 'react';
import { X, CheckCircle } from 'lucide-react';

const SuccessPopup = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div style={popupOverlayStyle}>
      <div style={popupContentStyle}>
        {/* Header */}
        <div style={popupHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle color="white" size={24} />
            <h2 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '600' }}>Success</h2>
          </div>
          <button onClick={onClose} style={closeBtnIconStyle}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <p style={{ color: '#333', textAlign: 'center', fontSize: '18px', margin: '0 0 24px 0' }}>
            {message}
          </p>
          <button onClick={onClose} style={popupCloseBtnStyle}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles moved here to keep the component self-contained
const popupOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const popupContentStyle = {
  backgroundColor: 'white', borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)', maxWidth: '400px',
  width: '90%', overflow: 'hidden'
};

const popupHeaderStyle = {
  backgroundColor: '#a33232', padding: '16px 24px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
};

const closeBtnIconStyle = {
  background: 'transparent', border: 'none', color: 'white',
  cursor: 'pointer', padding: '4px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const popupCloseBtnStyle = {
  width: '100%', padding: '12px', backgroundColor: '#a33232',
  color: 'white', border: 'none', borderRadius: '6px',
  fontSize: '16px', fontWeight: '500', cursor: 'pointer'
};

export default SuccessPopup;
