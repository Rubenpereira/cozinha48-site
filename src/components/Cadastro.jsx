import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Auth.css';

export default function Cadastro() {
  const [form, setForm] = useState({
    nomeLoja: '',
    nomeResponsavel: '',
    email: '',
    telefone: '',
    senha: '',
    plano: 'basico',
  });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.senha);
      await setDoc(doc(db, 'lojistas', user.uid), {
        uid: user.uid,
        nomeLoja: form.nomeLoja,
        nomeResponsavel: form.nomeResponsavel,
        email: form.email,
        telefone: form.telefone,
        plano: form.plano,
        status: 'ativo',
        periodoGratis: true,
        criadoEm: serverTimestamp(),
        inicioCobranca: null,
      });
      navigate('/painel');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setErro('Este e-mail já está cadastrado. Faça login.');
      } else if (err.code === 'auth/weak-password') {
        setErro('A senha deve ter no mínimo 6 caracteres.');
      } else {
        setErro('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <Link to="/" className="auth-logo">Cozinha<span>48</span></Link>
        <h2>Criar minha loja</h2>
        <p className="auth-sub">2 meses grátis. Sem cartão de crédito.</p>

        {erro && <div className="auth-error">{erro}</div>}

        <form onSubmit={handleCadastro} className="auth-form">
          <div className="fields-grid">
            <div className="field">
              <label>Nome da loja</label>
              <input
                name="nomeLoja"
                value={form.nomeLoja}
                onChange={handleChange}
                placeholder="Ex: Pizzaria do João"
                required
              />
            </div>
            <div className="field">
              <label>Seu nome</label>
              <input
                name="nomeResponsavel"
                value={form.nomeResponsavel}
                onChange={handleChange}
                placeholder="Nome completo"
                required
              />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="field">
              <label>Telefone / WhatsApp</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(22) 99999-9999"
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Escolha seu plano</label>
            <div className="plano-selector">
              <label className={`plano-opt ${form.plano === 'basico' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="plano"
                  value="basico"
                  checked={form.plano === 'basico'}
                  onChange={handleChange}
                />
                <div className="plano-info">
                  <span className="plano-titulo">Básico</span>
                  <span className="plano-preco">R$110/mês + 12%</span>
                </div>
              </label>
              <label className={`plano-opt ${form.plano === 'delivery' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="plano"
                  value="delivery"
                  checked={form.plano === 'delivery'}
                  onChange={handleChange}
                />
                <div className="plano-info">
                  <span className="plano-titulo">Delivery ⭐</span>
                  <span className="plano-preco">R$150/mês + 23%</span>
                </div>
              </label>
            </div>
          </div>

          <div className="field">
            <label>Senha</label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar minha conta grátis'}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
