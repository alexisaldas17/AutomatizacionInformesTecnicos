// src/components/HomeButton.js
import { useNavigate } from 'react-router-dom';
import React from 'react';

const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/home')}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        padding: '10px 15px',
        backgroundColor: '#333',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 1001,
      }}
    >
      🏠 INICIO
    </button>
  );
};

export default HomeButton;
