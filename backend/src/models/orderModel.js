import { DataTypes } from 'sequelize';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import { getObjectSignedUrl } from '../services/s3Service.js';
import { User } from './userModel.js';

export const ORDER_STATUSES = [
  'pending',
  'preparing',
  'on_the_way',
  'delivered',
  'cancelled',
];
export const PAYMENT_METHODS = ['cash', 'yape', 'plin'];
export const PAYMENT_STATUSES = ['pending', 'pending_review', 'verified', 'rejected'];
export const ORDER_EVENT_TYPES = [
  'order_created',
  'payment_proof_uploaded',
  'payment_status_changed',
  'order_status_changed',
  'priority_changed',
];

const orderStatusLabels = {
  pending: 'Pendiente de aceptacion',
  preparing: 'En preparacion',
  on_the_way: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const paymentStatusLabels = {
  pending: 'Pendiente',
  pending_review: 'Por revisar',
  verified: 'Verificado',
  rejected: 'Rechazado',
};

function toIsoString(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();

  return new Date(value).toISOString();
}

export const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'pending',
      validate: { isIn: [ORDER_STATUSES] },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    customer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    position: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    estimatedDelivery: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'estimated_delivery',
    },
    cart: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    orderPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'order_price',
      validate: { min: 0 },
    },
    priorityPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'priority_price',
      validate: { min: 0 },
    },
    paymentMethod: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'cash',
      field: 'payment_method',
      validate: { isIn: [PAYMENT_METHODS] },
    },
    paymentStatus: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'pending',
      field: 'payment_status',
      validate: { isIn: [PAYMENT_STATUSES] },
    },
    cashAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'cash_amount',
      validate: { min: 0 },
    },
    paymentProofKey: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'payment_proof_key',
    },
  },
  {
    tableName: 'orders',
    underscored: true,
  }
);

export const OrderEvent = sequelize.define(
  'OrderEvent',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'order_id',
      references: {
        model: Order,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { isIn: [ORDER_EVENT_TYPES] },
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    actorRole: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'system',
      field: 'actor_role',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: 'order_events',
    underscored: true,
  }
);

Order.hasMany(OrderEvent, {
  foreignKey: 'orderId',
  as: 'events',
  onDelete: 'CASCADE',
});
OrderEvent.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
});
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

function mapOrderEvent(event) {
  const plain = event.get({ plain: true });

  return {
    id: plain.id,
    orderId: plain.orderId,
    type: plain.type,
    title: plain.title,
    description: plain.description,
    actorRole: plain.actorRole,
    metadata: plain.metadata,
    createdAt: toIsoString(plain.createdAt),
  };
}

async function addOrderEvent({
  orderId,
  type,
  title,
  description = null,
  actorRole = 'system',
  metadata = {},
}) {
  return OrderEvent.create({
    orderId,
    type,
    title,
    description,
    actorRole,
    metadata,
  });
}

async function findOrderEvents(orderId) {
  const events = await OrderEvent.findAll({
    where: { orderId },
    order: [['createdAt', 'ASC']],
  });

  return events.map(mapOrderEvent);
}

async function mapOrder(order) {
  if (!order) return null;

  const plain = order.get({ plain: true });
  const paymentProofUrl = plain.paymentProofKey
    ? await getObjectSignedUrl(plain.paymentProofKey)
    : null;
  const events = await findOrderEvents(plain.id);

  return {
    id: plain.id,
    status: plain.status,
    userId: plain.userId,
    customer: plain.customer,
    phone: plain.phone,
    address: plain.address,
    position: plain.position,
    priority: plain.priority,
    estimatedDelivery: toIsoString(plain.estimatedDelivery),
    cart: plain.cart,
    orderPrice: Number(plain.orderPrice),
    priorityPrice: Number(plain.priorityPrice),
    paymentMethod: plain.paymentMethod,
    paymentStatus: plain.paymentStatus,
    cashAmount: plain.cashAmount === null ? null : Number(plain.cashAmount),
    paymentProofKey: plain.paymentProofKey,
    paymentProofUrl,
    events,
    createdAt: toIsoString(plain.createdAt),
    updatedAt: toIsoString(plain.updatedAt),
  };
}

export async function findOrderById(id) {
  const order = await Order.findByPk(id);
  return mapOrder(order);
}

export async function insertOrder(order) {
  const newOrder = await Order.create(order);
  await addOrderEvent({
    orderId: newOrder.id,
    type: 'order_created',
    title: 'Pedido creado',
    description: 'El cliente envio el pedido.',
    actorRole: 'customer',
    metadata: {
      paymentMethod: order.paymentMethod,
      total:
        Number(order.orderPrice || 0) + Number(order.priorityPrice || 0),
    },
  });

  return mapOrder(newOrder);
}

export async function setOrderPriority(id, priority, priorityPrice) {
  const order = await Order.findByPk(id);
  if (!order) return null;

  const previousPriority = order.priority;
  order.priority = priority;
  order.priorityPrice = priorityPrice;
  await order.save();

  if (previousPriority !== priority) {
    await addOrderEvent({
      orderId: id,
      type: 'priority_changed',
      title: priority ? 'Prioridad activada' : 'Prioridad desactivada',
      description: priority
        ? 'El cliente activo la entrega prioritaria.'
        : 'El cliente desactivo la entrega prioritaria.',
      actorRole: 'customer',
      metadata: { priority, priorityPrice },
    });
  }

  return mapOrder(order);
}

export async function findAdminOrders(filters = {}) {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.priority !== undefined) where.priority = filters.priority;
  if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

  if (filters.date) {
    const start = new Date(`${filters.date}T00:00:00`);
    const end = new Date(`${filters.date}T23:59:59.999`);
    where.createdAt = { [Op.between]: [start, end] };
  }

  const orders = await Order.findAll({
    where,
    order: [
      [
        sequelize.literal(
          "CASE status WHEN 'pending' THEN 0 WHEN 'preparing' THEN 1 WHEN 'on_the_way' THEN 2 WHEN 'delivered' THEN 3 ELSE 4 END"
        ),
        'ASC',
      ],
      ['priority', 'DESC'],
      ['createdAt', 'DESC'],
    ],
    limit: 100,
  });

  return Promise.all(orders.map(mapOrder));
}

export async function findOrdersByUserId(userId) {
  const orders = await Order.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });

  return Promise.all(orders.map(mapOrder));
}

export async function setOrderStatus(id, status) {
  const order = await Order.findByPk(id);
  if (!order) return null;

  const previousStatus = order.status;
  order.status = status;
  await order.save();

  if (previousStatus !== status) {
    await addOrderEvent({
      orderId: id,
      type: 'order_status_changed',
      title: `Pedido: ${orderStatusLabels[status] || status}`,
      description: `Estado cambiado de ${orderStatusLabels[previousStatus] || previousStatus} a ${orderStatusLabels[status] || status}.`,
      actorRole: 'admin',
      metadata: { previousStatus, status },
    });
  }

  return mapOrder(order);
}

export async function setPaymentStatus(id, paymentStatus) {
  const order = await Order.findByPk(id);
  if (!order) return null;

  const previousPaymentStatus = order.paymentStatus;
  order.paymentStatus = paymentStatus;
  await order.save();

  if (previousPaymentStatus !== paymentStatus) {
    await addOrderEvent({
      orderId: id,
      type: 'payment_status_changed',
      title: `Pago: ${paymentStatusLabels[paymentStatus] || paymentStatus}`,
      description: `Pago cambiado de ${paymentStatusLabels[previousPaymentStatus] || previousPaymentStatus} a ${paymentStatusLabels[paymentStatus] || paymentStatus}.`,
      actorRole: 'admin',
      metadata: { previousPaymentStatus, paymentStatus },
    });
  }

  return mapOrder(order);
}

export async function setPaymentProof(id, paymentProofKey) {
  const order = await Order.findByPk(id);
  if (!order) return null;

  order.paymentProofKey = paymentProofKey;
  order.paymentStatus = 'pending_review';
  await order.save();

  await addOrderEvent({
    orderId: id,
    type: 'payment_proof_uploaded',
    title: 'Comprobante subido',
    description: 'El cliente adjunto un comprobante de pago.',
    actorRole: 'customer',
    metadata: { paymentProofKey },
  });

  return mapOrder(order);
}
