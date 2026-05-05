// Helpers para o módulo financeiro.

export const PERIODOS = [
  { id: 'hoje', label: 'Hoje', dias: 1 },
  { id: '7dias', label: '7 dias', dias: 7 },
  { id: '30dias', label: '30 dias', dias: 30 },
  { id: '90dias', label: '90 dias', dias: 90 },
  { id: 'customizado', label: 'Personalizado', dias: 0 },
];

export function inicioDoDia(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function fimDoDia(data) {
  const d = new Date(data);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function calcularRange(periodoId, dataInicio, dataFim) {
  const hoje = new Date();
  const fim = fimDoDia(hoje);
  let inicio;

  if (periodoId === 'customizado' && dataInicio && dataFim) {
    return {
      inicio: inicioDoDia(new Date(dataInicio)),
      fim: fimDoDia(new Date(dataFim)),
    };
  }
  switch (periodoId) {
    case 'hoje':
      inicio = inicioDoDia(hoje);
      break;
    case '7dias':
      inicio = inicioDoDia(new Date(hoje.getTime() - 6 * 86400 * 1000));
      break;
    case '30dias':
      inicio = inicioDoDia(new Date(hoje.getTime() - 29 * 86400 * 1000));
      break;
    case '90dias':
      inicio = inicioDoDia(new Date(hoje.getTime() - 89 * 86400 * 1000));
      break;
    default:
      inicio = inicioDoDia(hoje);
  }
  return { inicio, fim };
}

export function chaveDia(data) {
  const d = inicioDoDia(data);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatBRL(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
}

/**
 * Gera array de dias (com 0 quando não há vendas) entre duas datas — pra desenhar o gráfico.
 */
export function expandirDias(inicio, fim) {
  const out = [];
  let d = inicioDoDia(inicio);
  const f = inicioDoDia(fim);
  while (d <= f) {
    out.push({ data: new Date(d), chave: chaveDia(d), valor: 0, qtd: 0 });
    d = new Date(d.getTime() + 86400 * 1000);
  }
  return out;
}

/**
 * Recebe pedidos entregues (já filtrados) e devolve agregados.
 */
export function calcularKPIs(pedidos) {
  const totalFaturado = pedidos.reduce(
    (acc, p) => acc + Number(p.total || 0),
    0
  );
  const numeroPedidos = pedidos.length;
  const ticketMedio = numeroPedidos > 0 ? totalFaturado / numeroPedidos : 0;
  return { totalFaturado, numeroPedidos, ticketMedio };
}

/**
 * Top itens (mais vendidos) com base em pedidos entregues.
 */
export function topItens(pedidos, limite = 10) {
  const map = new Map();
  pedidos.forEach((p) => {
    (p.itens || []).forEach((it) => {
      const key = it.nome || 'Sem nome';
      const cur = map.get(key) || { nome: key, qtd: 0, faturamento: 0 };
      cur.qtd += Number(it.quantidade || 1);
      cur.faturamento +=
        Number(it.preco || 0) * Number(it.quantidade || 1);
      map.set(key, cur);
    });
  });
  return [...map.values()]
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, limite);
}

/**
 * Distribuição por hora do dia (heatmap simples 0–23).
 */
export function distribuicaoPorHora(pedidos) {
  const horas = Array.from({ length: 24 }, (_, h) => ({ hora: h, qtd: 0 }));
  pedidos.forEach((p) => {
    const d = p.criadoEm?.toDate?.();
    if (d) horas[d.getHours()].qtd += 1;
  });
  return horas;
}

/**
 * Gera CSV com cabeçalho e linhas dadas. Dispara download no browser.
 */
export function baixarCSV(nomeArquivo, cabecalhos, linhas) {
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",;\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [
    cabecalhos.map(escape).join(';'),
    ...linhas.map((l) => l.map(escape).join(';')),
  ].join('\n');
  // BOM UTF-8 pra Excel abrir certinho com acentos
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}
