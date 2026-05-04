import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarReset, setMostrarReset] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/painel');
    } catch (err) {
      setErro('E-mail ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErro('Informe seu e-mail para resetar a senha.');
      return;
    }
    setErro('');
    setSucesso('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSucesso('✅ E-mail de reset enviado! Verifique sua caixa de entrada e spam.');
      setMostrarReset(false);
      setEmail('');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setErro('E-mail não encontrado.');
      } else {
        setErro('Erro ao enviar e-mail de reset. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">Cozinha<span>48</span></Link>
        
        {/* Link discreto para admin */}
        <Link to="/admin" className="link-admin-discreto" title="Acesso administrativo">
          🔐
        </Link>
        
        {!mostrarReset ? (
          <>
            <h2>Acessar painel</h2>
            <p className="auth-sub">Entre com sua conta de lojista</p>

            {erro && <div className="auth-error">{erro}</div>}
            {sucesso && <div className="auth-success">{sucesso}</div>}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="field">
                <label>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="field">
                <label>Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  required
                />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p className="auth-footer">
              Ainda não tem conta? <Link to="/cadastro">Cadastre-se grátis</Link>
            </p>

            <button 
              className="btn-esqueceu-senha"
              onClick={() => setMostrarReset(true)}
            >
              Esqueceu a senha?
            </button>
          </>
        ) : (
          <>
            <h2>Resetar senha</h2>
            <p className="auth-sub">Informe seu e-mail para receber um link</p>

            {erro && <div className="auth-error">{erro}</div>}
            {sucesso && <div className="auth-success">{sucesso}</div>}

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="field">
                <label>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link de reset'}
              </button>
            </form>

            <button 
              className="btn-voltar-login"
              onClick={() => {
                setMostrarReset(false);
                setErro('');
                setSucesso('');
              }}
            >
              ← Voltar ao login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
