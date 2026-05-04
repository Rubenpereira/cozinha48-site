import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import PainelAdmin from './PainelAdmin';
import PainelLojista from './PainelLojista';

export default function Painel() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { 
        navigate('/login'); 
        return; 
      }

      try {
        // Busca em "usuarios"
        const snap = await getDoc(doc(db, 'usuarios', user.uid));
        
        if (snap.exists()) {
          const dados = { uid: user.uid, ...snap.data() };
          console.log('=== DEBUG PAINEL ===');
          console.log('UID:', user.uid);
          console.log('Email:', user.email);
          console.log('Documento:', dados);
          console.log('role:', dados.role);
          console.log('tipo:', dados.tipo);
          console.log('plano:', dados.plano);
          console.log('===================');
          setUsuario(dados);
        } else {
          console.log('ERRO: Documento não encontrado para UID:', user.uid);
          navigate('/login');
        }
      } catch (error) {
        console.error('ERRO ao buscar usuário:', error);
        navigate('/login');
      }
      
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#111', gap: 16
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #333',
          borderTopColor: '#f97316', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <p style={{ color: '#999', fontFamily: 'DM Sans, sans-serif' }}>Carregando...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // DECISÃO: Admin ou Lojista?
  const isAdmin = usuario?.role === 'admin' || usuario?.tipo === 'admin';
  
  console.log('RENDERIZANDO:', isAdmin ? 'PAINEL ADMIN' : 'PAINEL LOJISTA');

  if (isAdmin) {
    return <PainelAdmin usuario={usuario} />;
  }
  
  return <PainelLojista usuario={usuario} />;
}
