import React, { useEffect, useMemo, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import useUsuario from '../hooks/useUsuario';
import SidebarLojista from './SidebarLojista';
import RelatorioFinanceiroPrint from './RelatorioFinanceiroPrint';
import {
  PERIODOS,
  calcularRange,
  expandirDias,
  chaveDia,
  formatBRL,
  calcularKPIs,
  topItens,
  distribuicaoPorHora,
  baixarCSV,
} from './financeiroUtils';
import './Financeiro.css';

export default function Financeiro() {
  const { usuario, loading: loadingUsuario } = useUsuario();
  const [pedidos, setPedidos] = useState([]);
  const [periodo, setPeriodo] = useState('30dias');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    if (!usuario?.uid) return;
    const q = query(
      collection(db, 'pedidos'),
      where('lojistaId', '==', usuario.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [usuario?.uid]);

  const { inicio, fim } = useMemo(
    () => calcularRange(periodo, dataInicio, dataFim),
    [periodo, dataInicio, dataFim]
  );

  // Pedidos entregues no período
  const pedidosPeriodo = useMemo(() => {
    return pedidos.filter((p) => {
      if (p.status !== 'entregue') return false;
      const d = p.criadoEm?.toDate?.();
      if (!d) return false;
      return d >= inicio && d <= fim;
    });
  }, [pedidos, inicio, fim]);

  const kpis = useMemo(() => calcularKPIs(pedidosPeriodo), [pedidosPeriodo]);
  const top = useMemo(() => topItens(pedidosPeriodo, 10), [pedidosPeriodo]);
  const horas = useMemo(
    () => distribuicaoPorHora(pedidosPeriodo),
    [pedidosPeriodo]
  );

  // Série diária
  const serieDiaria = useMemo(() => {
    const dias = expandirDias(inicio, fim);
    const map = new Map(dias.map((d) => [d.chave, d]));
    pedidosPeriodo.forEach((p) => {
      const d = p.criadoEm?.toDate?.();
      if (!d) return;
      const k = chaveDia(d);
      const slot = map.get(k);
      if (slot) {
        slot.valor += Number(p.total || 0);
        slot.qtd += 1;
      }
    });
    return [...map.values()];
  }, [pedidosPeriodo, inicio, fim]);

  // Comissão / repasse
  const taxaComissao = Number(usuario?.comissaoPlataforma ?? 10); // % default 10%
  const totalComissao = kpis.totalFaturado * (taxaComissao / 100);
  const repasseLiquido = kpis.totalFaturado - totalComissao;

  if (loadingUsuario) {
    return (
      <div className="painel-loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // ---- Exportações ----
  const exportarCSV = () => {
    const cabecalhos = [
      'Data',
      'Pedido',
      'Cliente',
      'Itens',
      'Total (R$)',
      'Taxa entrega',
      'Forma pagto',
    ];
    const linhas = pedidosPeriodo.map((p) => [
      p.criadoEm?.toDate?.()?.toLocaleString('pt-BR') || '',
      p.id.slice(-6).toUpperCase(),
      p.nomeCliente || '',
      p.itens?.length || 0,
      Number(p.total || 0).toFixed(2).replace('.', ','),
      Number(p.taxaEntrega || 0).toFixed(2).replace('.', ','),
      p.formaPagamento || '',
    ]);
    // Linha de totais
    linhas.push([]);
    linhas.push([
      'TOTAL',
      '',
      '',
      kpis.numeroPedidos,
      kpis.totalFaturado.toFixed(2).replace('.', ','),
      '',
      '',
    ]);
    const periodoLabel = `${chaveDia(inicio)}_a_${chaveDia(fim)}`;
    baixarCSV(`financeiro_${periodoLabel}.csv`, cabecalhos, linhas);
  };

  const exportarPDF = () => {
    // window.print() — relatório imprimível tem layout A4 dedicado e está sempre montado
    document.body.classList.add('imprimindo-relatorio');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('imprimindo-relatorio');
      }, 500);
    }, 100);
  };

  return (
    <div className="painel">
      <SidebarLojista ativa="financeiro" />
      <main className="painel-main">
        <header className="painel-header">
          <div>
            <h1>Financeiro 💰</h1>
            <p>{usuario?.nomeEstabelecimento}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secundario" onClick={exportarCSV}>
              📊 Exportar CSV
            </button>
            <button className="btn-primario" onClick={exportarPDF}>
              📄 Exportar PDF
            </button>
          </div>
        </header>

        {/* Filtros de período */}
        <div className="filtros-periodo">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              className={`cat-chip${periodo === p.id ? ' active' : ''}`}
              onClick={() => setPeriodo(p.id)}
            >
              {p.label}
            </button>
          ))}
          {periodo === 'customizado' && (
            <div className="datas-custom">
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
              <span>até</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="kpis-grid">
          <KPI
            icone="💵"
            label="Faturamento"
            valor={formatBRL(kpis.totalFaturado)}
            detalhe={`${kpis.numeroPedidos} pedido(s)`}
          />
          <KPI
            icone="🎯"
            label="Ticket médio"
            valor={formatBRL(kpis.ticketMedio)}
            detalhe="por pedido"
          />
          <KPI
            icone="💸"
            label={`Comissão (${taxaComissao}%)`}
            valor={formatBRL(totalComissao)}
            detalhe="da plataforma"
            cor="#ff6b6b"
          />
          <KPI
            icone="🤝"
            label="Repasse líquido"
            valor={formatBRL(repasseLiquido)}
            detalhe="ao lojista"
            cor="#86d39a"
          />
        </div>

        {/* Gráfico de faturamento */}
        <section className="card-detalhe" style={{ marginTop: 16 }}>
          <h2>Faturamento por dia</h2>
          {serieDiaria.length === 0 ? (
            <p className="sem-conteudo">Sem dados no período.</p>
          ) : (
            <GraficoBarras dados={serieDiaria} />
          )}
        </section>

        {/* Top itens + horários */}
        <div className="duas-colunas">
          <section className="card-detalhe">
            <h2>Top 10 itens vendidos</h2>
            {top.length === 0 ? (
              <p className="sem-conteudo">Sem dados.</p>
            ) : (
              <ol className="top-itens-lista">
                {top.map((it, i) => (
                  <li key={it.nome}>
                    <span className="rank">#{i + 1}</span>
                    <span className="nome-item">{it.nome}</span>
                    <span className="qtd-item">{it.qtd}x</span>
                    <span className="valor-item">{formatBRL(it.faturamento)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="card-detalhe">
            <h2>Pedidos por horário</h2>
            <Heatmap horas={horas} />
          </section>
        </div>

        {/* Tabela de pedidos do período (resumo) */}
        <section className="card-detalhe" style={{ marginTop: 16 }}>
          <h2>Pedidos no período ({pedidosPeriodo.length})</h2>
          {pedidosPeriodo.length === 0 ? (
            <p className="sem-conteudo">Nenhum pedido entregue no período.</p>
          ) : (
            <div className="tabela-pedidos-fin">
              <div className="tabela-th">
                <span>Data</span>
                <span>Pedido</span>
                <span>Cliente</span>
                <span>Itens</span>
                <span>Total</span>
              </div>
              {pedidosPeriodo.slice(0, 50).map((p) => (
                <div key={p.id} className="tabela-tr">
                  <span>
                    {p.criadoEm?.toDate?.()?.toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) || '—'}
                  </span>
                  <span className="pedido-num">
                    #{p.id.slice(-6).toUpperCase()}
                  </span>
                  <span>{p.nomeCliente || '—'}</span>
                  <span>{p.itens?.length || 0}</span>
                  <span>{formatBRL(p.total)}</span>
                </div>
              ))}
              {pedidosPeriodo.length > 50 && (
                <p className="sem-conteudo" style={{ padding: 12 }}>
                  Mostrando 50 de {pedidosPeriodo.length}. Exporte CSV para ver todos.
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Relatório imprimível (oculto na tela) */}
      <RelatorioFinanceiroPrint
        usuario={usuario}
        inicio={inicio}
        fim={fim}
        kpis={kpis}
        taxaComissao={taxaComissao}
        totalComissao={totalComissao}
        repasseLiquido={repasseLiquido}
        topItens={top}
        pedidos={pedidosPeriodo}
      />
    </div>
  );
}

// ===== Subcomponentes =====
function KPI({ icone, label, valor, detalhe, cor }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icone">{icone}</div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-valor" style={cor ? { color: cor } : undefined}>
          {valor}
        </div>
        <div className="kpi-detalhe">{detalhe}</div>
      </div>
    </div>
  );
}

function GraficoBarras({ dados }) {
  const max = Math.max(...dados.map((d) => d.valor), 1);
  const altura = 220;
  const margemY = 30;
  const larguraBarra = Math.max(8, Math.floor(620 / dados.length) - 4);
  const espacamento = 4;
  const larguraTotal = dados.length * (larguraBarra + espacamento);

  return (
    <div className="grafico-wrapper">
      <svg
        viewBox={`0 0 ${larguraTotal} ${altura + margemY}`}
        preserveAspectRatio="xMidYMid meet"
        className="grafico-svg"
      >
        {/* Linhas de grade */}
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <line
            key={p}
            x1="0"
            x2={larguraTotal}
            y1={altura - altura * p + 5}
            y2={altura - altura * p + 5}
            stroke="#2a2a2a"
            strokeDasharray="3,3"
          />
        ))}
        {dados.map((d, i) => {
          const h = (d.valor / max) * altura;
          const x = i * (larguraBarra + espacamento);
          const y = altura - h + 5;
          return (
            <g key={d.chave}>
              <rect
                x={x}
                y={y}
                width={larguraBarra}
                height={h}
                fill="#f97316"
                rx="2"
              >
                <title>
                  {d.data.toLocaleDateString('pt-BR')}: {formatBRL(d.valor)} ({d.qtd} pedidos)
                </title>
              </rect>
              {dados.length <= 31 && (
                <text
                  x={x + larguraBarra / 2}
                  y={altura + 22}
                  fill="#777"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {d.data.getDate()}/{d.data.getMonth() + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="grafico-legenda">
        Máx: <strong>{formatBRL(max)}</strong> · Período de{' '}
        {dados[0]?.data.toLocaleDateString('pt-BR')} a{' '}
        {dados[dados.length - 1]?.data.toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
}

function Heatmap({ horas }) {
  const max = Math.max(...horas.map((h) => h.qtd), 1);
  return (
    <div className="heatmap-wrap">
      <div className="heatmap">
        {horas.map((h) => {
          const intensidade = h.qtd / max;
          return (
            <div
              key={h.hora}
              className="heatmap-celula"
              style={{
                background: h.qtd === 0
                  ? '#1a1a1a'
                  : `rgba(249, 115, 22, ${0.15 + intensidade * 0.85})`,
              }}
              title={`${h.hora}h: ${h.qtd} pedido(s)`}
            >
              <span className="heatmap-num">{h.qtd > 0 ? h.qtd : ''}</span>
              <span className="heatmap-hora">{h.hora}h</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
