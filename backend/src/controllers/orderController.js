import { UniqueConstraintError } from 'sequelize';
import {
  findOrderById,
  findOrdersByUserId,
  insertOrder,
  PAYMENT_METHODS,
  setPaymentProof,
  setOrderPriority,
} from '../models/orderModel.js';
import { findPaymentSetting } from '../models/paymentSettingModel.js';
import { deleteObject, uploadPaymentProof } from '../services/s3Service.js';
import {
  calculateOrderPrice,
  calculatePriorityPrice,
  createOrderId,
  estimatedDeliveryDate,
} from '../utils/orders.js';

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

function validateCart(cart) {
  return (
    Array.isArray(cart) &&
    cart.length > 0 &&
    cart.every((item) => {
      const hasValidIdentity = item.isCustom
        ? typeof item.pizzaId === 'string' &&
          item.pizzaId.startsWith('custom-') &&
          item.customRecipe?.size &&
          Array.isArray(item.customRecipe?.items) &&
          item.customRecipe.items.length > 0
        : Number.isInteger(Number(item.pizzaId));
      const hasMenuIdentity =
        hasValidIdentity ||
        (!item.isCustom &&
          typeof item.pizzaId === 'string' &&
          item.pizzaId.startsWith('menu-') &&
          Number.isInteger(Number(item.sourcePizzaId)));

      return (
        hasMenuIdentity &&
        item.name &&
        Number(item.quantity) > 0 &&
        Number(item.unitPrice) >= 0 &&
        Number(item.totalPrice) >= 0
      );
    })
  );
}

function isDigitalPaymentReady(setting) {
  return Boolean(
    setting?.isActive &&
      setting.accountHolder?.trim() &&
      (setting.phone?.trim() || setting.qrImageKey)
  );
}

export async function getOrder(req, res, next) {
  try {
    const order = await findOrderById(req.params.id.toUpperCase());
    if (!order) throw notFound(`Order ${req.params.id} not found`);

    res.json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req, res, next) {
  try {
    const {
      customer,
      phone,
      address,
      position = null,
      priority = false,
      cart,
      paymentMethod = 'cash',
      cashAmount = null,
    } = req.body;

    if (!customer) throw badRequest('Customer is required');
    if (!phone) throw badRequest('Phone is required');
    if (!address) throw badRequest('Address is required');
    if (!validateCart(cart)) throw badRequest('Cart is invalid');
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      throw badRequest('Payment method is invalid');
    }

    if (['yape', 'plin'].includes(paymentMethod)) {
      const paymentSetting = await findPaymentSetting(paymentMethod);

      if (!isDigitalPaymentReady(paymentSetting)) {
        throw badRequest('Payment method is not available right now');
      }
    }

    const orderPrice = calculateOrderPrice(cart);
    const priorityPrice = calculatePriorityPrice(orderPrice, priority);
    const totalPrice = orderPrice + priorityPrice;
    const parsedCashAmount =
      cashAmount === null || cashAmount === '' ? null : Number(cashAmount);

    if (paymentMethod === 'cash') {
      if (!Number.isFinite(parsedCashAmount) || parsedCashAmount < totalPrice) {
        throw badRequest('Cash amount must cover the order total');
      }
    }

    const order = await insertOrder({
      id: createOrderId(),
      userId: req.user?.role === 'customer' ? req.user.id : null,
      customer,
      phone,
      address,
      position,
      priority,
      cart,
      estimatedDelivery: estimatedDeliveryDate(),
      orderPrice,
      priorityPrice,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending_review',
      cashAmount: paymentMethod === 'cash' ? parsedCashAmount : null,
    });

    res.status(201).json({ status: 'success', data: order });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      err.statusCode = 409;
      err.message = 'Order id collision. Please try again.';
    }
    next(err);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await findOrdersByUserId(req.user.id);
    res.json({ status: 'success', data: orders });
  } catch (err) {
    next(err);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const existingOrder = await findOrderById(req.params.id.toUpperCase());
    if (!existingOrder) throw notFound(`Order ${req.params.id} not found`);

    const priority = Boolean(req.body.priority);
    const priorityPrice = calculatePriorityPrice(existingOrder.orderPrice, priority);
    const order = await setOrderPriority(existingOrder.id, priority, priorityPrice);

    res.json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
}

export async function uploadOrderPaymentProof(req, res, next) {
  try {
    const order = await findOrderById(req.params.id.toUpperCase());
    if (!order) throw notFound(`Order ${req.params.id} not found`);

    if (!['yape', 'plin'].includes(order.paymentMethod)) {
      throw badRequest('Payment proof is only allowed for Yape or Plin');
    }

    const previousPaymentProofKey = order.paymentProofKey;
    const paymentProofKey = await uploadPaymentProof({
      orderId: order.id,
      file: req.file,
    });
    const updatedOrder = await setPaymentProof(order.id, paymentProofKey);

    if (previousPaymentProofKey) await deleteObject(previousPaymentProofKey);

    res.json({ status: 'success', data: updatedOrder });
  } catch (err) {
    next(err);
  }
}
