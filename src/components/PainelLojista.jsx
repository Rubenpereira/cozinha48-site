import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import SidebarLojista from './SidebarLojista';

export default function PainelLojista({ usuario }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario?.uid) return;

    const q = query(
      collection(db, 'pedidos'),
      where('lojistaId', '==', usuario.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const dados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Ordena em memória (sem exigir índice)
      dados.sort((a, b) => (b.criadoEm?.toDate?.() || 0) - (a.criadoEm?.toDate?.() || 0));
      setPedidos(dados);
      setLoading(false);
    });
    return () => unsub();
  }, [usuario?.uid]);

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
      <SidebarLojista ativa="dashboard" />

      {/* Main Content */}
      <main className="painel-main">
        <header className="painel-header">
          <div>
            <h1>Olá, {usuario?.nome?.split(' ')[0]} 👋</h1>
            <p>{usuario?.nomeEstabelecimento} · Plano {usuario?.plano === 'delivery' ? 'Delivery' : 'Básico'}</p>
          </div>
          {usuario?.mensalidadeIsentaAte && new Date(usuario.mensalidadeIsentaAte.toDate()) > new Date() && (
            <div className="badge-gratis">✨ Período gratuito ativo</div>
          )}
        </header>

        {/* Stats */}
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
              <div className="stat-value">{pedidos.filter((p) => p.status === 'pendente').length}</div>
              <div className="stat-label">Aguardando confirmação</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🛵</span>
            <div>
              <div className="stat-value">{pedidos.filter((p) => p.status === 'em_entrega').length}</div>
              <div className="stat-label">Em entrega</div>
            </div>
          </div>
        </div>

        {/* Pedidos Recentes */}
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
                  {pedido.status === 'em_entrega' && (
                    <button
                      className="btn-rastrear"
                      onClick={() => navigate(`/rastreamento/${pedido.id}`)}
                    >
                      🗺️ Rastrear
                    </button>
                  )}
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
