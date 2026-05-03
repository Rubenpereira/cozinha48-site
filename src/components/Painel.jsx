import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Painel.css';

export default function Painel() {
  const [lojista, setLojista] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { navigate('/login'); return; }

    // Carrega dados do lojista
    getDoc(doc(db, 'lojistas', user.uid)).then((snap) => {
      if (snap.exists()) setLojista(snap.data());
      setLoading(false);
    });

    // Escuta pedidos em tempo real
    const q = query(
      collection(db, 'pedidos'),
      where('lojistaId', '==', user.uid),
      orderBy('criadoEm', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const pedidosHoje = pedidos.filter((p) => {
    const hoje = new Date();
    const data = p.criadoEm?.toDate?.();
    return data && data.toDateString() === hoje.toDateString();
  });

  const totalHoje = pedidosHoje.reduce((acc, p) => acc + (p.total || 0), 0);

  if (loading) {
    return (
      <div className="painel-loading">
        <div className="spinner"></div>
        <p>Carregando painel...</p>
      </div>
    );
  }

  return (
    <div className="painel">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">Cozinha<span>48</span></div>
        <nav className="sidebar-nav">
          <button className="nav-item active">📊 Dashboard</button>
          <button className="nav-item" onClick={() => navigate('/painel/pedidos')}>📋 Pedidos</button>
          <button className="nav-item" onClick={() => navigate('/painel/cardapio')}>🍽️ Cardápio</button>
          <button className="nav-item" onClick={() => navigate('/painel/financeiro')}>💰 Financeiro</button>
          <button className="nav-item" onClick={() => navigate('/painel/loja')}>⚙️ Minha loja</button>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>← Sair</button>
      </aside>

      {/* Conteúdo */}
      <main className="painel-main">
        <header className="painel-header">
          <div>
            <h1>Olá, {lojista?.nomeResponsavel?.split(' ')[0]} 👋</h1>
            <p>{lojista?.nomeLoja} · Plano {lojista?.plano === 'delivery' ? 'Delivery' : 'Básico'}</p>
          </div>
          {lojista?.periodoGratis && (
            <div className="badge-gratis">✨ Período gratuito ativo</div>
          )}
        </header>

        {/* Cards de resumo */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div>
              <div className="stat-value">{pedidosHoje.length}</div>
              <div className="stat-label">Pedidos hoje</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💵</span>
            <div>
              <div className="stat-value">R$ {totalHoje.toFixed(2).replace('.', ',')}</div>
              <div className="stat-label">Faturamento hoje</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📋</span>
            <div>
              <div className="stat-value">{pedidos.filter(p => p.status === 'pendente').length}</div>
              <div className="stat-label">Aguardando confirmação</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🛵</span>
            <div>
              <div className="stat-value">{pedidos.filter(p => p.status === 'em_entrega').length}</div>
              <div className="stat-label">Em entrega</div>
            </div>
          </div>
        </div>

        {/* Pedidos recentes */}
        <section className="pedidos-section">
          <div className="section-header">
            <h2>Pedidos recentes</h2>
            <button className="btn-ver-todos" onClick={() => navigate('/painel/pedidos')}>
              Ver todos →
            </button>
          </div>

          {pedidos.length === 0 ? (
            <div className="empty-state">
              <p>🛒 Nenhum pedido ainda</p>
              <span>Quando chegarem pedidos, eles aparecerão aqui em tempo real.</span>
            </div>
          ) : (
            <div className="pedidos-list">
              {pedidos.slice(0, 8).map((pedido) => (
                <div className="pedido-row" key={pedido.id}>
                  <div className="pedido-num">#{pedido.id.slice(-6).toUpperCase()}</div>
                  <div className="pedido-cliente">{pedido.nomeCliente || '—'}</div>
                  <div className="pedido-itens">{pedido.itens?.length || 0} itens</div>
                  <div className="pedido-valor">R$ {(pedido.total || 0).toFixed(2).replace('.', ',')}</div>
                  <div className={`pedido-status status-${pedido.status}`}>
                    {statusLabel(pedido.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function statusLabel(status) {
  const labels = {
    pendente: '⏳ Pendente',
    confirmado: '✅ Confirmado',
    em_preparo: '👨‍🍳 Em preparo',
    em_entrega: '🛵 Em entrega',
    entregue: '✓ Entregue',
    cancelado: '✕ Cancelado',
  };
  return labels[status] || status;
}
