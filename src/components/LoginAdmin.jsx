import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Auth.css';

export default function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, senha);
      
      // Verifica se é admin
      const snap = await getDoc(doc(db, 'usuarios', user.uid));
      
      if (!snap.exists()) {
        setErro('Usuário não encontrado.');
        await auth.signOut();
        setLoading(false);
        return;
      }
      
      const dados = snap.data();
      
      // Só permite admin
      if (dados.role !== 'admin' && dados.tipo !== 'admin') {
        setErro('⛔ Acesso negado. Esta área é exclusiva para administradores.');
        await auth.signOut();
        setLoading(false);
        return;
      }
      
      // É admin, redireciona
      navigate('/admin/dashboard');
      
    } catch (err) {
      setErro('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="admin-badge-header">🔐 ADMIN</div>
        <Link to="/" className="auth-logo">Cozinha<span>48</span></Link>
        <h2>Painel Administrativo</h2>
        <p className="auth-sub">Acesso restrito</p>

        {erro && <div className="auth-error">{erro}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="field">
            <label>E-mail de administrador</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cozinha48.com"
              required
            />
          </div>
          <div className="field">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha de admin"
              required
            />
          </div>
          <button type="submit" className="auth-btn admin-btn" disabled={loading}>
            {loading ? 'Verificando...' : 'Acessar Painel Admin'}
          </button>
        </form>

        <p className="auth-footer">
          Não é admin? <Link to="/login">Acessar como lojista</Link>
        </p>
      </div>
    </div>
  );
}
