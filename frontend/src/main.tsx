// src/main.tsx
// (AuthProvider 경로 수정 완료)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// (수정) './contexts/AuthContext' (O)
import { AuthProvider } from './contexts/AuthContext'; 
import App from './App';

// (수정) './index.css' (O) - index.css가 src 폴더에 있으므로
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);