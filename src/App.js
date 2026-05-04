import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Painel from './components/Painel';
import Rastreamento from './components/Rastreamento';

// Rota protegida — só acessa se estiver logado
function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #333', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Páginas que mostram o Navbar
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Painel protegido */}
        <Route path="/painel" element={<PrivateRoute><Painel /></PrivateRoute>} />
        <Route path="/painel/*" element={<PrivateRoute><Painel /></PrivateRoute>} />
        <Route path="/rastreamento/:pedidoId" element={<PrivateRoute><Rastreamento /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
