import React from 'react';
import { formatBRL } from './pedidoUtils';
import './RelatorioFinanceiroPrint.css';

/**
 * Layout A4 do relatório financeiro, otimizado para "Imprimir > Salvar como PDF".
 * Fica oculto na tela e só é exibido quando body tem .imprimindo-relatorio + @media print.
 */
export default function RelatorioFinanceiroPrint({
  usuario,
  inicio,
  fim,
  kpis,
  taxaComissao,
  totalComissao,
  repasseLiquido,
  topItens = [],
  pedidos = [],
}) {
  const periodoStr = `${inicio.toLocaleDateString('pt-BR')} a ${fim.toLocaleDateString('pt-BR')}`;
  return (
    <div className="relatorio-print">
      <header className="rel-cabecalho">
        <div>
          <h1>Relatório Financeiro</h1>
          <p>{usuario?.nomeEstabelecimento || 'Cozinha48'}</p>
          {usuario?.cnpj && <p>CNPJ: {usuario.cnpj}</p>}
        </div>
        <div className="rel-periodo">
          <span>Período</span>
          <strong>{periodoStr}</strong>
        </div>
      </header>

      <section className="rel-kpis">
        <div className="rel-kpi">
          <span>Faturamento total</span>
          <strong>{formatBRL(kpis.totalFaturado)}</strong>
        </div>
        <div className="rel-kpi">
          <span>Pedidos entregues</span>
          <strong>{kpis.numeroPedidos}</strong>
        </div>
        <div className="rel-kpi">
          <span>Ticket médio</span>
          <strong>{formatBRL(kpis.ticketMedio)}</strong>
        </div>
        <div className="rel-kpi">
          <span>Comissão da plataforma ({taxaComissao}%)</span>
          <strong className="rel-vermelho">- {formatBRL(totalComissao)}</strong>
        </div>
        <div className="rel-kpi rel-destaque">
          <span>Repasse líquido ao lojista</span>
          <strong className="rel-verde">{formatBRL(repasseLiquido)}</strong>
        </div>
      </section>

      <section className="rel-secao">
        <h2>Top itens vendidos</h2>
        {topItens.length === 0 ? (
          <p>Sem dados no período.</p>
        ) : (
          <table className="rel-tabela">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qtd vendida</th>
                <th>Faturamento</th>
              </tr>
            </thead>
            <tbody>
              {topItens.map((it, i) => (
                <tr key={it.nome}>
                  <td>{i + 1}</td>
                  <td>{it.nome}</td>
                  <td>{it.qtd}</td>
                  <td>{formatBRL(it.faturamento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rel-secao">
        <h2>Pedidos do período ({pedidos.length})</h2>
        {pedidos.length === 0 ? (
          <p>Sem pedidos entregues no período.</p>
        ) : (
          <table className="rel-tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Pagto</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.criadoEm?.toDate?.()?.toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) || '—'}
                  </td>
                  <td>#{p.id.slice(-6).toUpperCase()}</td>
                  <td>{p.nomeCliente || '—'}</td>
                  <td>{p.itens?.length || 0}</td>
                  <td>{p.formaPagamento || '—'}</td>
                  <td>{formatBRL(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="rel-rodape">
        Relatório gerado em {new Date().toLocaleString('pt-BR')} ·
        Cozinha48 — Plataforma de delivery
      </footer>
    </div>
  );
}
