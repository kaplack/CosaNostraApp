import crypto from 'crypto';

export function createOrderId() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

export function calculateOrderPrice(cart) {
  return cart.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
}

export function calculatePriorityPrice(orderPrice, priority) {
  return priority ? Math.round(orderPrice * 0.2 * 100) / 100 : 0;
}

export function estimatedDeliveryDate(minutes = 35) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
