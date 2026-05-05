import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import useUsuario from '../hooks/useUsuario';
import SidebarLojista from './SidebarLojista';
import { statusLabel } from './pedidoUtils';
import './Pedidos.css';

const STATUS_FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendente', label: '⏳ Pendentes' },
  { id: 'confirmado', label: '✅ Confirmados' },
  { id: 'em_preparo', label: '👨‍🍳 Em preparo' },
  { id: 'em_entrega', label: '🛵 Em entrega' },
  { id: 'entregue', label: '✓ Entregues' },
  { id: 'cancelado', label: '✕ Cancelados' },
];

export default function Pedidos() {
  const { usuario, loading: loadingUsuario } = useUsuario();
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario?.uid) return;
    const q = query(
      collection(db, 'pedidos'),
      where('lojistaId', '==', usuario.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const dados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      dados.sort(
        (a, b) =>
          (b.criadoEm?.toDate?.() || 0) - (a.criadoEm?.toDate?.() || 0)
      );
      setPedidos(dados);
    });
    return () => unsub();
  }, [usuario?.uid]);

  const lista = useMemo(() => {
    let l = pedidos;
    if (filtro !== 'todos') l = l.filter((p) => p.status === filtro);
    if (busca.trim()) {
      const b = busca.toLowerCase();
      l = l.filter(
        (p) =>
          p.id.toLowerCase().includes(b) ||
          (p.nomeCliente || '').toLowerCase().includes(b) ||
          (p.telefoneCliente || '').toLowerCase().includes(b)
      );
    }
    return l;
  }, [pedidos, filtro, busca]);

  if (loadingUsuario) {
    return (
      <div className="painel-loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  const contagem = (st) => pedidos.filter((p) => p.status === st).length;

  return (
    <div className="painel">
      <SidebarLojista ativa="pedidos" />
      <main className="painel-main">
        <header className="painel-header">
          <div>
            <h1>Pedidos 📋</h1>
            <p>{pedidos.length} pedido(s) no total</p>
          </div>
          <input
            className="busca-pedidos"
            placeholder="Buscar por nº, cliente ou telefone…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </header>

        <div className="filtros-pedidos">
          {STATUS_FILTROS.map((f) => (
            <button
              key={f.id}
              className={`cat-chip${filtro === f.id ? ' active' : ''}`}
              onClick={() => setFiltro(f.id)}
            >
              {f.label}
              {f.id !== 'todos' && (
                <span className="contador-chip">{contagem(f.id)}</span>
              )}
            </button>
          ))}
        </div>

        {lista.length === 0 ? (
          <div className="empty-state">
            <p>📭 Nenhum pedido encontrado</p>
            <span>Ajuste os filtros ou aguarde novos pedidos.</span>
          </div>
        ) : (
          <div className="pedidos-tabela">
            <div className="pedidos-th">
              <span>Número</span>
              <span>Cliente</span>
              <span>Itens</span>
              <span>Total</span>
              <span>Status</span>
              <span>Data</span>
              <span></span>
            </div>
            {lista.map((p) => (
              <div
                key={p.id}
                className="pedidos-tr"
                onClick={() => navigate(`/painel/pedido/${p.id}`)}
              >
                <span className="pedido-num">
                  #{p.id.slice(-6).toUpperCase()}
                </span>
                <span>{p.nomeCliente || '—'}</span>
                <span>{p.itens?.length || 0}</span>
                <span>
                  R$ {Number(p.total || 0).toFixed(2).replace('.', ',')}
                </span>
                <span className={`pedido-status status-${p.status}`}>
                  {statusLabel(p.status)}
                </span>
                <span className="pedido-data">
                  {p.criadoEm?.toDate
                    ? p.criadoEm.toDate().toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </span>
                <span className="abrir-arrow">›</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
