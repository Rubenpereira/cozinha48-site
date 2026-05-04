import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import PainelAdmin from './PainelAdmin';

export default function AdminDashboard() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acessoNegado, setAcessoNegado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/admin');
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'usuarios', user.uid));
        
        if (!snap.exists()) {
          await signOut(auth);
          navigate('/admin');
          return;
        }

        const dados = { uid: user.uid, ...snap.data() };
        
        // Verifica se é admin
        if (dados.role !== 'admin' && dados.tipo !== 'admin') {
          setAcessoNegado(true);
          setTimeout(async () => {
            await signOut(auth);
            navigate('/admin');
          }, 3000);
          return;
        }

        setUsuario(dados);
        setLoading(false);

      } catch (error) {
        console.error('Erro:', error);
        navigate('/admin');
      }
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
        <p style={{ color: '#999' }}>Verificando permissões...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (acessoNegado) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#111', gap: 20
      }}>
        <div style={{ fontSize: 64 }}>⛔</div>
        <h1 style={{ color: '#fff', fontFamily: 'Syne, sans-serif', fontSize: 28 }}>Acesso Negado</h1>
        <p style={{ color: '#999', maxWidth: 400, textAlign: 'center' }}>
          Você não tem permissões de administrador. Redirecionando...
        </p>
      </div>
    );
  }

  return <PainelAdmin usuario={usuario} />;
}
