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
      if (!user) { navigate('/login'); return; }

      console.log('🔍 UID do usuário logado:', user.uid);

      // Busca em "usuarios" (apps Android) primeiro
      let snap = await getDoc(doc(db, 'usuarios', user.uid));

      console.log('📄 Documento encontrado em usuarios:', snap.exists());
      
      // Se não achou, tenta em "lojistas" (cadastro antigo do site)
      if (!snap.exists()) {
        snap = await getDoc(doc(db, 'lojistas', user.uid));
        console.log('📄 Documento encontrado em lojistas:', snap.exists());
      }

      if (snap.exists()) {
        const dados = snap.data();
        console.log('📋 Dados do documento:', dados);
        console.log('🔐 Role:', dados.role);
        console.log('👤 Tipo:', dados.tipo);
        setUsuario({ uid: user.uid, ...dados });
      } else {
        console.log('❌ Usuário autenticado mas sem documento!');
        // Usuário autenticado mas sem documento — redireciona
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

  // Detecta o tipo do usuário e renderiza o painel correto
  const role = usuario?.role || usuario?.tipo;

  if (role === 'admin') return <PainelAdmin usuario={usuario} />;
  return <PainelLojista usuario={usuario} />;
}
