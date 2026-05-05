import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import useUsuario from '../hooks/useUsuario';
import SidebarLojista from './SidebarLojista';
import Comanda from './Comanda';
import {
  statusLabel,
  proximoStatus,
  STATUS_FLOW,
  formatBRL,
  formatDataHora,
} from './pedidoUtils';
import './PedidoDetalhe.css';

export default function PedidoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, loading: loadingUsuario } = useUsuario();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(
      doc(db, 'pedidos', id),
      (snap) => {
        if (snap.exists()) {
          setPedido({ id: snap.id, ...snap.data() });
          setErro('');
        } else {
          setErro('Pedido não encontrado.');
        }
        setLoading(false);
      },
      (e) => {
        console.error(e);
        setErro('Erro ao carregar pedido.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id]);

  if (loadingUsuario || loading) {
    return (
      <div className="painel-loading">
        <div className="spinner"></div>
        <p>Carregando pedido...</p>
      </div>
    );
  }

  // Segurança — só o lojista dono pode ver
  if (pedido && pedido.lojistaId !== usuario?.uid) {
    return (
      <div className="painel">
        <SidebarLojista ativa="pedidos" />
        <main className="painel-main">
          <p style={{ color: '#ff6b6b', padding: 24 }}>
            Você não tem acesso a este pedido.
          </p>
        </main>
      </div>
    );
  }

  const mudarStatus = async (novoStatus) => {
    if (!pedido) return;
    setSalvando(true);
    try {
      await updateDoc(doc(db, 'pedidos', pedido.id), {
        status: novoStatus,
        atualizadoEm: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar status.');
    } finally {
      setSalvando(false);
    }
  };

  const cancelar = async () => {
    if (!window.confirm('Cancelar este pedido?')) return;
    await mudarStatus('cancelado');
  };

  const proximo = pedido ? proximoStatus(pedido.status) : null;
  const podeAvancar = proximo && pedido?.status !== 'cancelado';
  const podeCancelar =
    pedido && !['entregue', 'cancelado'].includes(pedido.status);

  const subtotal = (pedido?.itens || []).reduce(
    (acc, i) => acc + Number(i.preco || 0) * Number(i.quantidade || 1),
    0
  );
  const taxaEntrega = Number(pedido?.taxaEntrega || 0);
  const desconto = Number(pedido?.desconto || 0);

  return (
    <div className="painel">
      <SidebarLojista ativa="pedidos" />
      <main className="painel-main">
        <button className="btn-voltar" onClick={() => navigate('/painel/pedidos')}>
          ← Voltar para pedidos
        </button>

        {erro ? (
          <div className="cardapio-erro">{erro}</div>
        ) : pedido ? (
          <>
            <header className="painel-header">
              <div>
                <h1>Pedido #{pedido.id.slice(-6).toUpperCase()}</h1>
                <p>{formatDataHora(pedido.criadoEm)}</p>
              </div>
              <div className={`pedido-status-grande status-${pedido.status}`}>
                {statusLabel(pedido.status)}
              </div>
            </header>

            {/* Linha do tempo de status */}
            <div className="timeline-status">
              {STATUS_FLOW.map((st, idx) => {
                const idxAtual = STATUS_FLOW.indexOf(pedido.status);
                const isAtivo = pedido.status !== 'cancelado' && idx <= idxAtual;
                return (
                  <div
                    key={st}
                    className={`timeline-item${isAtivo ? ' ativo' : ''}`}
                  >
                    <div className="timeline-bola"></div>
                    <span>{statusLabel(st)}</span>
                  </div>
                );
              })}
            </div>

            <div className="detalhe-grid">
              {/* Itens */}
              <section className="card-detalhe">
                <h2>Itens</h2>
                {(pedido.itens || []).length === 0 ? (
                  <p className="sem-conteudo">Sem itens.</p>
                ) : (
                  <ul className="lista-itens">
                    {pedido.itens.map((it, i) => (
                      <li key={i}>
                        <div className="item-linha">
                          <span className="qtd">{it.quantidade || 1}×</span>
                          <span className="nome">{it.nome}</span>
                          <span className="valor">
                            {formatBRL(
                              Number(it.preco || 0) * Number(it.quantidade || 1)
                            )}
                          </span>
                        </div>
                        {it.observacao && (
                          <div className="obs">↳ {it.observacao}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="totais">
                  <div>
                    <span>Subtotal</span>
                    <span>{formatBRL(subtotal)}</span>
                  </div>
                  {taxaEntrega > 0 && (
                    <div>
                      <span>Taxa de entrega</span>
                      <span>{formatBRL(taxaEntrega)}</span>
                    </div>
                  )}
                  {desconto > 0 && (
                    <div>
                      <span>Desconto</span>
                      <span>-{formatBRL(desconto)}</span>
                    </div>
                  )}
                  <div className="total-final">
                    <span>Total</span>
                    <strong>{formatBRL(pedido.total || subtotal + taxaEntrega - desconto)}</strong>
                  </div>
                </div>
              </section>

              {/* Cliente + Endereço */}
              <section className="card-detalhe">
                <h2>Cliente</h2>
                <p><strong>{pedido.nomeCliente || '—'}</strong></p>
                {pedido.telefoneCliente && (
                  <p>
                    📞{' '}
                    <a href={`tel:${pedido.telefoneCliente}`}>
                      {pedido.telefoneCliente}
                    </a>
                  </p>
                )}
                {pedido.emailCliente && <p>✉️ {pedido.emailCliente}</p>}

                <h2 style={{ marginTop: 16 }}>Endereço de entrega</h2>
                {pedido.endereco ? (
                  <>
                    <p>
                      {pedido.endereco.rua}, {pedido.endereco.numero}
                      {pedido.endereco.complemento &&
                        ` · ${pedido.endereco.complemento}`}
                    </p>
                    <p>
                      {pedido.endereco.bairro} ·{' '}
                      {pedido.endereco.cidade}/{pedido.endereco.uf}
                    </p>
                    {pedido.endereco.cep && <p>CEP {pedido.endereco.cep}</p>}
                    {pedido.endereco.referencia && (
                      <p className="obs">
                        Referência: {pedido.endereco.referencia}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="sem-conteudo">Retirada no local.</p>
                )}

                <h2 style={{ marginTop: 16 }}>Pagamento</h2>
                <p>{pedido.formaPagamento || '—'}</p>
                {pedido.troco && <p>Troco para: {formatBRL(pedido.troco)}</p>}

                {pedido.observacao && (
                  <>
                    <h2 style={{ marginTop: 16 }}>Observações</h2>
                    <p className="obs">{pedido.observacao}</p>
                  </>
                )}
              </section>
            </div>

            {/* Ações */}
            <div className="acoes-pedido">
              <button
                className="btn-secundario"
                onClick={() => window.print()}
                title="Imprimir comanda"
              >
                🖨️ Imprimir comanda
              </button>
              {pedido.status === 'em_entrega' && (
                <button
                  className="btn-secundario"
                  onClick={() => navigate(`/rastreamento/${pedido.id}`)}
                >
                  🗺️ Rastrear entrega
                </button>
              )}
              {podeCancelar && (
                <button
                  className="btn-secundario btn-perigo"
                  onClick={cancelar}
                  disabled={salvando}
                >
                  ✕ Cancelar pedido
                </button>
              )}
              {podeAvancar && (
                <button
                  className="btn-primario"
                  onClick={() => mudarStatus(proximo)}
                  disabled={salvando}
                >
                  Avançar para: {statusLabel(proximo)}
                </button>
              )}
            </div>
          </>
        ) : null}
      </main>

      {/* Comanda imprimível (escondida na tela) */}
      {pedido && <Comanda pedido={pedido} usuario={usuario} />}
    </div>
  );
}
