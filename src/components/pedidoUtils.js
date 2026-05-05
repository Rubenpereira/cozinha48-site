// Utilitários compartilhados entre componentes que lidam com pedidos.

export const STATUS_FLOW = [
  'pendente',
  'confirmado',
  'em_preparo',
  'em_entrega',
  'entregue',
];

export function statusLabel(status) {
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

export function proximoStatus(status) {
  const idx = STATUS_FLOW.indexOf(status);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export function formatBRL(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
}

export function formatDataHora(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
