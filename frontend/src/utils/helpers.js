export function formatCurrency(value) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'PEN',
  }).format(value);
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function calcMinutesLeft(dateStr) {
  const d1 = new Date().getTime();
  const d2 = new Date(dateStr).getTime();
  return Math.round((d2 - d1) / 60000);
}

export function formatOrderStatus(status) {
  const labels = {
    pending: 'Pendiente de aceptacion',
    preparing: 'En preparacion',
    on_the_way: 'En camino',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  return labels[status] || status;
}

export function formatPaymentMethod(method) {
  const labels = {
    cash: 'Efectivo',
    yape: 'Yape',
    plin: 'Plin',
  };

  return labels[method] || method;
}

export function formatPaymentStatus(status) {
  const labels = {
    pending: 'Pendiente',
    pending_review: 'Por revisar',
    verified: 'Verificado',
    rejected: 'Rechazado',
  };

  return labels[status] || status;
}

export function normalizeOrderId(value) {
  return String(value || '')
    .trim()
    .replace(/^#+/, '')
    .replace(/\s/g, '')
    .toUpperCase();
}
