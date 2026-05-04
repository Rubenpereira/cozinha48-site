import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Painel.css';

export default function PainelAdmin({ usuario }) {
  const [lojistas, setLojistas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [abaPrincipal, setAbaPrincipal] = useState('pedidos');
  const navigate = useNavigate();

  // Buscar lojistas em tempo real
  useEffect(() => {
    const q = query(
      collection(db, 'usuarios'),
      where('tipo', '==', 'lojista'),
      orderBy('dataCadastro', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setLojistas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Buscar clientes em tempo real
  useEffect(() => {
    const q = query(
      collection(db, 'usuarios'),
      where('tipo', '==', 'cliente'),
      orderBy('dataCadastro', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setClientes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Buscar todos os pedidos em tempo real
  useEffect(() => {
    const q = query(
      collection(db, 'pedidos'),
      orderBy('criadoEm', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Resumos
  const totalFaturado = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
  const totalComissoes = pedidos.reduce((acc, p) => {
    const taxa = p.lojistaPlano === 'delivery' ? 0.15 : 0.09;
    return acc + (p.total * taxa || 0);
  }, 0);
  const pedidosEntregues = pedidos.filter((p) => p.status === 'entregue').length;
  const pedidosEmEntrega = pedidos.filter((p) => p.status === 'em_entrega').length;

  return (
    <div className="painel">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">Cozinha<span>48</span></div>
        <div className="sidebar-badge">👨‍💼 ADMIN</div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${abaPrincipal === 'pedidos' ? 'active' : ''}`}
            onClick={() => setAbaPrincipal('pedidos')}
          >
            📋 Pedidos
          </button>
          <button
            className={`nav-item ${abaPrincipal === 'lojistas' ? 'active' : ''}`}
            onClick={() => setAbaPrincipal('lojistas')}
          >
            🏪 Lojistas
          </button>
          <button
            className={`nav-item ${abaPrincipal === 'clientes' ? 'active' : ''}`}
            onClick={() => setAbaPrincipal('clientes')}
          >
            👥 Clientes
          </button>
          <button
            className={`nav-item ${abaPrincipal === 'financeiro' ? 'active' : ''}`}
            onClick={() => setAbaPrincipal('financeiro')}
          >
            💰 Financeiro
          </button>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>← Sair</button>
      </aside>

      {/* Main Content */}
      <main className="painel-main">
        <header className="painel-header">
          <div>
            <h1>Painel Administrativo 🎛️</h1>
            <p>Controle total da plataforma Cozinha48</p>
          </div>
        </header>

        {/* ABA: PEDIDOS */}
        {abaPrincipal === 'pedidos' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">📦</span>
                <div>
                  <div className="stat-value">{pedidos.length}</div>
                  <div className="stat-label">Total de pedidos</div>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✓</span>
                <div>
                  <div className="stat-value">{pedidosEntregues}</div>
                  <div className="stat-label">Entregues</div>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🛵</span>
                <div>
                  <div className="stat-value">{pedidosEmEntrega}</div>
                  <div className="stat-label">Em entrega</div>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💵</span>
                <div>
                  <div className="stat-value">R$ {totalFaturado.toFixed(2).replace('.', ',')}</div>
                  <div className="stat-label">Total faturado</div>
                </div>
              </div>
            </div>

            <section className="pedidos-section">
              <div className="section-header">
                <h2>Todos os Pedidos</h2>
              </div>
              {pedidos.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum pedido ainda</p>
                </div>
              ) : (
                <div className="pedidos-list">
                  {pedidos.map((pedido) => (
                    <div className="pedido-row" key={pedido.id}>
                      <div className="pedido-num">#{pedido.id.slice(-6).toUpperCase()}</div>
                      <div className="pedido-cliente">{pedido.nomeCliente || '—'}</div>
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
          </>
        )}

        {/* ABA: LOJISTAS */}
        {abaPrincipal === 'lojistas' && (
          <section className="lojistas-section">
            <div className="section-header">
              <h2>Lojistas Cadastrados</h2>
              <span className="badge-count">{lojistas.length} lojistas</span>
            </div>
            {lojistas.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum lojista cadastrado</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Plano</th>
                      <th>Status</th>
                      <th>Faturamento</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lojistas.map((lojista) => (
                      <tr key={lojista.id}>
                        <td className="nome-lojista">{lojista.nomeEstabelecimento}</td>
                        <td>{lojista.email}</td>
                        <td>{lojista.plano === 'delivery' ? '⭐ Delivery' : '📦 Básico'}</td>
                        <td>
                          <span className={`badge-status status-${lojista.status}`}>
                            {lojista.status === 'aberto' ? '🟢 Ativo' : '🔴 Bloqueado'}
                          </span>
                        </td>
                        <td>R$ {(lojista.faturamentoTotal || 0).toFixed(2).replace('.', ',')}</td>
                        <td>
                          <button className="btn-detalhes">Ver detalhes</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ABA: CLIENTES */}
        {abaPrincipal === 'clientes' && (
          <section className="clientes-section">
            <div className="section-header">
              <h2>Clientes Cadastrados</h2>
              <span className="badge-count">{clientes.length} clientes</span>
            </div>
            {clientes.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum cliente cadastrado</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Telefone</th>
                      <th>Data de Cadastro</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente) => (
                      <tr key={cliente.id}>
                        <td>{cliente.nome || '—'}</td>
                        <td>{cliente.email}</td>
                        <td>{cliente.telefone || '—'}</td>
                        <td>
                          {cliente.dataCadastro
                            ? new Date(cliente.dataCadastro.toDate()).toLocaleDateString('pt-BR')
                            : '—'}
                        </td>
                        <td>
                          <button className="btn-detalhes">Ver detalhes</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ABA: FINANCEIRO */}
        {abaPrincipal === 'financeiro' && (
          <section className="financeiro-section">
            <div className="section-header">
              <h2>Resumo Financeiro Geral</h2>
            </div>
            <div className="financeiro-grid">
              <div className="financeiro-card">
                <h3>Total Faturado</h3>
                <p className="valor">R$ {totalFaturado.toFixed(2).replace('.', ',')}</p>
                <span className="descricao">Somatório de todos os pedidos</span>
              </div>
              <div className="financeiro-card">
                <h3>Total de Comissões</h3>
                <p className="valor">R$ {totalComissoes.toFixed(2).replace('.', ',')}</p>
                <span className="descricao">9% (Básico) + 15% (Delivery)</span>
              </div>
              <div className="financeiro-card">
                <h3>Lucro Bruto</h3>
                <p className="valor">R$ {(totalFaturado - totalComissoes).toFixed(2).replace('.', ',')}</p>
                <span className="descricao">Faturado - Comissões</span>
              </div>
              <div className="financeiro-card">
                <h3>Pedidos Entregues</h3>
                <p className="valor">{pedidosEntregues}</p>
                <span className="descricao">Total de entregas concluídas</span>
              </div>
            </div>
          </section>
        )}
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
