import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Auth.css';

export default function Cadastro() {
  const [form, setForm] = useState({
    nomeEstabelecimento: '',
    nome: '',
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

      // Salva em "usuarios" igual aos apps Android, com tipo: "lojista"
      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        tipo: 'lojista',
        role: 'lojista',
        nome: form.nome,
        nomeEstabelecimento: form.nomeEstabelecimento,
        email: form.email,
        telefone: form.telefone,
        plano: form.plano,
        status: 'aberto',
        avaliacao: 0,
        bannerUrl: '',
        categoria: '',
        cnpj: '',
        descricao: '',
        diasFuncionamento: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
        enderecoEstabelecimento: {
          bairro: '', cep: '', cidade: '', complemento: '',
          estado: '', lat: 0, lng: 0, numero: '', rua: ''
        },
        faturamentoTotal: 0,
        mensalidadeIsentaAte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        mensalidadeValor: form.plano === 'basico' ? 70 : 110,
        raioEntregaKm: 5,
        taxaEntrega: 0,
        tempoMedioEntrega: '30 min',
        dataCadastro: serverTimestamp(),
        dataInicioPlanno: serverTimestamp(),
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
              <label>Nome do estabelecimento</label>
              <input name="nomeEstabelecimento" value={form.nomeEstabelecimento}
                onChange={handleChange} placeholder="Ex: Pizzaria do João" required />
            </div>
            <div className="field">
              <label>Seu nome</label>
              <input name="nome" value={form.nome}
                onChange={handleChange} placeholder="Nome completo" required />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="seu@email.com" required />
            </div>
            <div className="field">
              <label>Telefone / WhatsApp</label>
              <input name="telefone" value={form.telefone}
                onChange={handleChange} placeholder="(22) 99999-9999" required />
            </div>
          </div>

          <div className="field">
            <label>Escolha seu plano</label>
            <div className="plano-selector">
              <label className={`plano-opt ${form.plano === 'basico' ? 'selected' : ''}`}>
                <input type="radio" name="plano" value="basico"
                  checked={form.plano === 'basico'} onChange={handleChange} />
                <div className="plano-info">
                  <span className="plano-titulo">Básico</span>
                  <span className="plano-preco">R$70/mês + 9% comissão</span>
                </div>
              </label>
              <label className={`plano-opt ${form.plano === 'delivery' ? 'selected' : ''}`}>
                <input type="radio" name="plano" value="delivery"
                  checked={form.plano === 'delivery'} onChange={handleChange} />
                <div className="plano-info">
                  <span className="plano-titulo">Delivery ⭐</span>
                  <span className="plano-preco">R$110/mês + 15% comissão</span>
                </div>
              </label>
            </div>
          </div>

          <div className="field">
            <label>Senha</label>
            <input type="password" name="senha" value={form.senha}
              onChange={handleChange} placeholder="Mínimo 6 caracteres" required minLength={6} />
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
