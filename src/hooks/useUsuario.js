import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Hook que carrega o usuário logado + seus dados do Firestore (coleção "usuarios").
 * Redireciona para /login se não autenticado ou doc não encontrado.
 *
 * Retorna: { usuario, loading, isAdmin }
 */
export default function useUsuario() {
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
        const snap = await getDoc(doc(db, 'usuarios', user.uid));
        if (snap.exists()) {
          setUsuario({ uid: user.uid, ...snap.data() });
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('useUsuario:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  const isAdmin = usuario?.role === 'admin' || usuario?.tipo === 'admin';
  return { usuario, loading, isAdmin };
}
