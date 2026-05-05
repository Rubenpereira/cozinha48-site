import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Sidebar reutilizável do painel do lojista.
 * Detecta a rota ativa automaticamente via useLocation.
 *
 * Props:
 *  - ativa (opcional): força qual item fica destacado ("dashboard"|"pedidos"|"cardapio"|"financeiro"|"loja")
 */
export default function SidebarLojista({ ativa }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const itemAtivo =
    ativa ||
    (pathname.startsWith('/painel/cardapio') && 'cardapio') ||
    (pathname.startsWith('/painel/pedidos') && 'pedidos') ||
    (pathname.startsWith('/painel/pedido') && 'pedidos') ||
    (pathname.startsWith('/painel/financeiro') && 'financeiro') ||
    (pathname.startsWith('/painel/loja') && 'loja') ||
    'dashboard';

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const itens = [
    { id: 'dashboard', label: '📊 Dashboard', path: '/painel' },
    { id: 'pedidos', label: '📋 Pedidos', path: '/painel/pedidos' },
    { id: 'cardapio', label: '🍽️ Cardápio', path: '/painel/cardapio' },
    { id: 'financeiro', label: '💰 Financeiro', path: '/painel/financeiro' },
    { id: 'loja', label: '⚙️ Minha loja', path: '/painel/loja' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Cozinha<span>48</span></div>
      <nav className="sidebar-nav">
        {itens.map((it) => (
          <button
            key={it.id}
            className={`nav-item${itemAtivo === it.id ? ' active' : ''}`}
            onClick={() => navigate(it.path)}
          >
            {it.label}
          </button>
        ))}
      </nav>
      <button className="sidebar-logout" onClick={handleLogout}>← Sair</button>
    </aside>
  );
}
