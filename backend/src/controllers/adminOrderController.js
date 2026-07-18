import {
  findAdminOrders,
  findOrderById,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  setOrderStatus,
  setPaymentStatus,
} from '../models/orderModel.js';

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function notFound(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

function canAcceptOrder(order) {
  return order.paymentMethod === 'cash' || order.paymentStatus === 'verified';
}

export async function listAdminOrders(req, res, next) {
  try {
    const { status, date, priority, paymentStatus } = req.query;

    if (status && !ORDER_STATUSES.includes(status)) {
      throw badRequest('Estado de pedido invalido');
    }

    if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
      throw badRequest('Estado de pago invalido');
    }

    const orders = await findAdminOrders({
      status,
      date,
      priority: priority === undefined ? undefined : priority === 'true',
      paymentStatus,
    });

    res.json({ status: 'success', data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getAdminOrder(req, res, next) {
  try {
    const order = await findOrderById(req.params.id.toUpperCase());
    if (!order) throw notFound(`Pedido ${req.params.id} no encontrado`);

    res.json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminOrderStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      throw badRequest('Estado de pedido invalido');
    }

    const currentOrder = await findOrderById(req.params.id.toUpperCase());
    if (!currentOrder) throw notFound(`Pedido ${req.params.id} no encontrado`);

    if (status === 'preparing' && !canAcceptOrder(currentOrder)) {
      throw badRequest('Verifica el pago antes de aceptar este pedido');
    }

    const order = await setOrderStatus(req.params.id.toUpperCase(), status);
    if (!order) throw notFound(`Pedido ${req.params.id} no encontrado`);

    res.json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminPaymentStatus(req, res, next) {
  try {
    const { paymentStatus } = req.body;

    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      throw badRequest('Estado de pago invalido');
    }

    const order = await setPaymentStatus(req.params.id.toUpperCase(), paymentStatus);
    if (!order) throw notFound(`Pedido ${req.params.id} no encontrado`);

    res.json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}
