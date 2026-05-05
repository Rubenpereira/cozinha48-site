import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import useUsuario from '../hooks/useUsuario';
import SidebarLojista from './SidebarLojista';
import { comprimirImagem } from '../utils/imagem';
import './Cardapio.css';

/**
 * Página de gerenciamento de cardápio do lojista.
 * Modelagem Firestore:
 *  - "categorias":  { lojistaId, nome, ordem, criadoEm }
 *  - "cardapio":    { lojistaId, categoriaId, nome, descricao, preco,
 *                     disponivel, imagem (data URL base64), ordem,
 *                     criadoEm, atualizadoEm }
 *
 * Imagens são comprimidas e armazenadas como base64 dentro do próprio
 * documento (sem necessidade do Firebase Storage / plano Blaze).
 */
export default function Cardapio() {
  const { usuario, loading: loadingUsuario, isAdmin } = useUsuario();
  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null); // null = "todos"
  const [modal, setModal] = useState(null); // { tipo: 'item'|'categoria', dados? }
  const [erro, setErro] = useState('');

  // ---- Listeners Firestore ----
  useEffect(() => {
    if (!usuario?.uid) return;

    const qCategorias = query(
      collection(db, 'categorias'),
      where('lojistaId', '==', usuario.uid)
    );
    const unsubCategorias = onSnapshot(qCategorias, (snap) => {
      const dados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      dados.sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
      setCategorias(dados);
    });

    const qItens = query(
      collection(db, 'cardapio'),
      where('lojistaId', '==', usuario.uid)
    );
    const unsubItens = onSnapshot(qItens, (snap) => {
      const dados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      dados.sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
      setItens(dados);
    });

    return () => {
      unsubCategorias();
      unsubItens();
    };
  }, [usuario?.uid]);

  if (loadingUsuario) {
    return (
      <div className="painel-loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="painel">
        <main className="painel-main">
          <p style={{ color: '#999', padding: 24 }}>
            O cardápio é exclusivo de lojistas.
          </p>
        </main>
      </div>
    );
  }

  const itensFiltrados = categoriaAtiva
    ? itens.filter((i) => i.categoriaId === categoriaAtiva)
    : itens;

  // ---- Ações de categoria ----
  const salvarCategoria = async (form) => {
    setErro('');
    try {
      if (form.id) {
        await updateDoc(doc(db, 'categorias', form.id), {
          nome: form.nome.trim(),
          ordem: Number(form.ordem) || 0,
        });
      } else {
        await addDoc(collection(db, 'categorias'), {
          lojistaId: usuario.uid,
          nome: form.nome.trim(),
          ordem: Number(form.ordem) || categorias.length,
          criadoEm: serverTimestamp(),
        });
      }
      setModal(null);
    } catch (e) {
      console.error(e);
      setErro('Erro ao salvar categoria.');
    }
  };

  const excluirCategoria = async (cat) => {
    const itensNaCategoria = itens.filter((i) => i.categoriaId === cat.id);
    if (itensNaCategoria.length > 0) {
      alert(
        `Esta categoria tem ${itensNaCategoria.length} item(ns). ` +
          `Mova ou exclua os itens antes de excluir a categoria.`
      );
      return;
    }
    if (!window.confirm(`Excluir a categoria "${cat.nome}"?`)) return;
    try {
      await deleteDoc(doc(db, 'categorias', cat.id));
    } catch (e) {
      console.error(e);
      setErro('Erro ao excluir categoria.');
    }
  };

  // ---- Ações de item ----
  const salvarItem = async (form, file) => {
    setErro('');
    try {
      // Se há arquivo novo, comprime e converte pra base64 (sem Firebase Storage)
      let imagemDataUrl = null;
      if (file) {
        try {
          imagemDataUrl = await comprimirImagem(file, {
            maxLado: 600,
            qualidade: 0.75,
          });
        } catch (err) {
          console.error(err);
          setErro('Não foi possível processar a imagem. Tente outra foto.');
          return;
        }
      }

      const dadosBase = {
        lojistaId: usuario.uid,
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        preco: Number(form.preco) || 0,
        categoriaId: form.categoriaId || null,
        disponivel: form.disponivel !== false,
        ordem: Number(form.ordem) || 0,
        atualizadoEm: serverTimestamp(),
      };
      // Só sobrescreve imagem quando o usuário escolheu um arquivo novo
      if (imagemDataUrl) dadosBase.imagem = imagemDataUrl;

      if (form.id) {
        await updateDoc(doc(db, 'cardapio', form.id), dadosBase);
      } else {
        await addDoc(collection(db, 'cardapio'), {
          ...dadosBase,
          imagem: imagemDataUrl ?? null,
          criadoEm: serverTimestamp(),
        });
      }

      setModal(null);
    } catch (e) {
      console.error(e);
      setErro('Erro ao salvar item. Tente novamente.');
    }
  };

  const toggleDisponivel = async (item) => {
    try {
      await updateDoc(doc(db, 'cardapio', item.id), {
        disponivel: !item.disponivel,
        atualizadoEm: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const excluirItem = async (item) => {
    if (!window.confirm(`Excluir o item "${item.nome}"?`)) return;
    try {
      await deleteDoc(doc(db, 'cardapio', item.id));
      // Imagem é base64 dentro do próprio doc — apagar o doc já remove a foto.
    } catch (e) {
      console.error(e);
      setErro('Erro ao excluir item.');
    }
  };

  return (
    <div className="painel">
      <SidebarLojista ativa="cardapio" />

      <main className="painel-main">
        <header className="painel-header">
          <div>
            <h1>Cardápio 🍽️</h1>
            <p>{usuario?.nomeEstabelecimento}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-secundario"
              onClick={() => setModal({ tipo: 'categoria' })}
            >
              + Categoria
            </button>
            <button
              className="btn-primario"
              onClick={() =>
                categorias.length === 0
                  ? alert('Crie uma categoria primeiro.')
                  : setModal({ tipo: 'item' })
              }
            >
              + Novo item
            </button>
          </div>
        </header>

        {erro && <div className="cardapio-erro">{erro}</div>}

        {/* Filtro por categoria */}
        <div className="categorias-bar">
          <button
            className={`cat-chip${categoriaAtiva === null ? ' active' : ''}`}
            onClick={() => setCategoriaAtiva(null)}
          >
            Todos ({itens.length})
          </button>
          {categorias.map((cat) => {
            const count = itens.filter((i) => i.categoriaId === cat.id).length;
            return (
              <div key={cat.id} className="cat-chip-wrap">
                <button
                  className={`cat-chip${
                    categoriaAtiva === cat.id ? ' active' : ''
                  }`}
                  onClick={() => setCategoriaAtiva(cat.id)}
                >
                  {cat.nome} ({count})
                </button>
                <button
                  className="cat-edit"
                  title="Editar"
                  onClick={() => setModal({ tipo: 'categoria', dados: cat })}
                >
                  ✏️
                </button>
                <button
                  className="cat-edit"
                  title="Excluir"
                  onClick={() => excluirCategoria(cat)}
                >
                  🗑️
                </button>
              </div>
            );
          })}
        </div>

        {/* Lista de itens */}
        {itensFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>📋 Nenhum item neste filtro</p>
            <span>
              {categorias.length === 0
                ? 'Comece criando uma categoria, depois adicione itens.'
                : 'Clique em "+ Novo item" para adicionar.'}
            </span>
          </div>
        ) : (
          <div className="itens-grid">
            {itensFiltrados.map((item) => {
              const cat = categorias.find((c) => c.id === item.categoriaId);
              return (
                <article
                  key={item.id}
                  className={`item-card${!item.disponivel ? ' indisponivel' : ''}`}
                >
                  <div className="item-foto">
                    {item.imagem ? (
                      <img src={item.imagem} alt={item.nome} />
                    ) : (
                      <span className="item-foto-placeholder">🍽️</span>
                    )}
                    {!item.disponivel && (
                      <div className="item-badge">Indisponível</div>
                    )}
                  </div>
                  <div className="item-conteudo">
                    <div className="item-cat">{cat?.nome || 'Sem categoria'}</div>
                    <h3>{item.nome}</h3>
                    {item.descricao && <p>{item.descricao}</p>}
                    <div className="item-rodape">
                      <strong>
                        R$ {Number(item.preco || 0).toFixed(2).replace('.', ',')}
                      </strong>
                      <div className="item-acoes">
                        <button
                          className="btn-icone"
                          title={item.disponivel ? 'Ocultar' : 'Mostrar'}
                          onClick={() => toggleDisponivel(item)}
                        >
                          {item.disponivel ? '👁️' : '🚫'}
                        </button>
                        <button
                          className="btn-icone"
                          title="Editar"
                          onClick={() => setModal({ tipo: 'item', dados: item })}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icone btn-perigo"
                          title="Excluir"
                          onClick={() => excluirItem(item)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Modais */}
      {modal?.tipo === 'categoria' && (
        <ModalCategoria
          categoria={modal.dados}
          onSalvar={salvarCategoria}
          onFechar={() => setModal(null)}
        />
      )}
      {modal?.tipo === 'item' && (
        <ModalItem
          item={modal.dados}
          categorias={categorias}
          onSalvar={salvarItem}
          onFechar={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ===== Modal Categoria =====
function ModalCategoria({ categoria, onSalvar, onFechar }) {
  const [nome, setNome] = useState(categoria?.nome || '');
  const [ordem, setOrdem] = useState(categoria?.ordem ?? 0);
  const [salvando, setSalvando] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setSalvando(true);
    await onSalvar({ id: categoria?.id, nome, ordem });
    setSalvando(false);
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{categoria ? 'Editar categoria' : 'Nova categoria'}</h2>
        <form onSubmit={submit}>
          <label>
            Nome
            <input
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Pizzas"
              required
            />
          </label>
          <label>
            Ordem de exibição
            <input
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
            />
          </label>
          <div className="modal-acoes">
            <button type="button" className="btn-secundario" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== Modal Item =====
function ModalItem({ item, categorias, onSalvar, onFechar }) {
  const [form, setForm] = useState({
    id: item?.id,
    nome: item?.nome || '',
    descricao: item?.descricao || '',
    preco: item?.preco || '',
    categoriaId: item?.categoriaId || categorias[0]?.id || '',
    disponivel: item?.disponivel !== false,
    ordem: item?.ordem ?? 0,
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(item?.imagem || null);
  const [salvando, setSalvando] = useState(false);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      alert('Imagem muito grande (máx 10 MB). Será comprimida ao salvar.');
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.categoriaId) return;
    setSalvando(true);
    await onSalvar(form, file);
    setSalvando(false);
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal modal-grande" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? 'Editar item' : 'Novo item'}</h2>
        <form onSubmit={submit}>
          <div className="modal-cols">
            {/* Foto */}
            <div className="campo-foto">
              <label className="foto-area">
                {previewUrl ? (
                  <img src={previewUrl} alt="Prévia" />
                ) : (
                  <span>📷 Clique para escolher foto</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPick}
                  style={{ display: 'none' }}
                />
              </label>
              <small>JPG ou PNG. Será redimensionada para 600px e comprimida automaticamente.</small>
            </div>

            {/* Campos */}
            <div className="campos-form">
              <label>
                Nome
                <input
                  autoFocus
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex.: Pizza Margherita"
                  required
                />
              </label>
              <label>
                Descrição
                <textarea
                  rows={3}
                  value={form.descricao}
                  onChange={(e) =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                  placeholder="Molho de tomate, mussarela, manjericão…"
                />
              </label>
              <div className="form-row">
                <label>
                  Preço (R$)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.preco}
                    onChange={(e) =>
                      setForm({ ...form, preco: e.target.value })
                    }
                    placeholder="0,00"
                    required
                  />
                </label>
                <label>
                  Categoria
                  <select
                    value={form.categoriaId}
                    onChange={(e) =>
                      setForm({ ...form, categoriaId: e.target.value })
                    }
                    required
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>
                  Ordem
                  <input
                    type="number"
                    value={form.ordem}
                    onChange={(e) =>
                      setForm({ ...form, ordem: e.target.value })
                    }
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.disponivel}
                    onChange={(e) =>
                      setForm({ ...form, disponivel: e.target.checked })
                    }
                  />
                  Disponível para venda
                </label>
              </div>
            </div>
          </div>
          <div className="modal-acoes">
            <button type="button" className="btn-secundario" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
