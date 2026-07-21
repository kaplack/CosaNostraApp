import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, redirect } from 'react-router-dom';
import {
  getAdminOrders,
  updateAdminPaymentStatus,
  updateAdminOrderStatus,
} from '../../services/apiAdminOrders';
import { clearSession, getCurrentAdmin } from '../../services/apiAuth';
import {
  formatCurrency,
  formatDate,
  formatOrderStatus,
  formatPaymentMethod,
  formatPaymentStatus,
} from '../../utils/helpers';

const orderStatuses = ['pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
const paymentStatuses = ['pending', 'pending_review', 'verified', 'rejected'];
const orderStatusTransitions = {
  pending: ['preparing', 'cancelled'],
  preparing: ['on_the_way', 'cancelled'],
  on_the_way: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

function canAcceptOrder(order) {
  return order.paymentMethod === 'cash' || order.paymentStatus === 'verified';
}

function needsPaymentReview(order) {
  return order.paymentMethod !== 'cash' && order.paymentStatus === 'pending_review';
}

function availableOrderStatuses(order) {
  const nextStatuses = orderStatusTransitions[order.status] || [];
  const allowedStatuses = canAcceptOrder(order)
    ? nextStatuses
    : nextStatuses.filter((status) => status === 'cancelled');

  return [order.status, ...allowedStatuses];
}

function formatRecipeQuantity(recipeItem) {
  const value = Number(recipeItem.totalQuantity);
  const quantity = Number.isInteger(value) ? String(value) : value.toFixed(2);

  return `${quantity} ${recipeItem.unit}`;
}

function OrderLineItem({ item }) {
  if (!item.customRecipe) {
    return (
      <li className="flex justify-between gap-4 py-3 text-sm">
        <span>
          <strong>{item.quantity}x</strong> {item.name}
        </span>
        <span>{formatCurrency(item.totalPrice)}</span>
      </li>
    );
  }

  return (
    <li className="py-3 text-sm">
      <div className="rounded-md border border-yellow-200 bg-yellow-50/70 p-3">
        <div className="flex justify-between gap-4">
          <div>
            <p className="font-semibold">
              {item.quantity}x {item.name}
            </p>
            <p className="text-xs text-stone-600">
              {item.customRecipe.size.name} / {item.customRecipe.size.diameterCm} cm /{' '}
              {item.customRecipe.size.slices} tajadas
            </p>
          </div>
          <p className="shrink-0 font-semibold">{formatCurrency(item.totalPrice)}</p>
        </div>

        <div className="mt-3 border-t border-yellow-200 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase text-stone-500">
            Receta personalizada
          </p>
          <ul className="space-y-2">
            {item.customRecipe.items.map((recipeItem) => (
              <li
                key={`${recipeItem.ingredientId}-${recipeItem.area}`}
                className="grid grid-cols-[1fr_auto] gap-3 text-xs"
              >
                <span>
                  <span className="font-semibold text-stone-800">
                    {recipeItem.name} x{recipeItem.portions}
                  </span>
                  <span className="text-stone-500"> - {recipeItem.areaLabel}</span>
                </span>
                <span className="font-semibold text-stone-800">
                  {formatRecipeQuantity(recipeItem)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

function MobileOrderCard({
  order,
  isSelected,
  onSelect,
  onAccept,
  onCancel,
  onStatusChange,
}) {
  const statusOptions = availableOrderStatuses(order);

  return (
    <article
      className={`rounded-md border p-4 ${
        isSelected
          ? 'border-yellow-400 bg-yellow-50'
          : needsPaymentReview(order)
            ? 'border-amber-200 bg-amber-50/70'
            : 'border-stone-200 bg-white'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">Pedido {order.id}</p>
            <p className="text-sm text-stone-600">{order.customer}</p>
          </div>
          <p className="shrink-0 font-semibold">
            {formatCurrency(order.orderPrice + order.priorityPrice)}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-stone-400">Estado</p>
            <p className="font-semibold">{formatOrderStatus(order.status)}</p>
          </div>
          <div>
            <p className="text-stone-400">Pago</p>
            <p className="font-semibold">
              {formatPaymentMethod(order.paymentMethod)} ·{' '}
              {formatPaymentStatus(order.paymentStatus)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {order.priority && (
            <span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold uppercase text-red-700">
              Prioridad
            </span>
          )}
          {needsPaymentReview(order) && (
            <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">
              Revisar comprobante
            </span>
          )}
          <span className="text-[11px] text-stone-400">{formatDate(order.createdAt)}</span>
        </div>
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-200 pt-3">
        {order.status === 'pending' && (
          <>
            <button
              type="button"
              disabled={!canAcceptOrder(order)}
              onClick={onAccept}
              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                canAcceptOrder(order)
                  ? 'bg-green-600 text-white'
                  : 'cursor-not-allowed bg-stone-200 text-stone-400'
              }`}
            >
              Aceptar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Cancelar
            </button>
          </>
        )}
        <select
          value={order.status}
          disabled={statusOptions.length === 1}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label={`Estado del pedido ${order.id}`}
          className="min-w-0 flex-1 rounded-full border border-stone-200 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
        >
          {statusOptions.map((item) => (
            <option value={item} key={item}>
              {formatOrderStatus(item)}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    paymentStatus: '',
  });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);

  const totalPending = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === 'pending' ||
          order.status === 'preparing' ||
          order.status === 'on_the_way',
      ).length,
    [orders],
  );

  const totalPaymentReview = useMemo(
    () => orders.filter(needsPaymentReview).length,
    [orders],
  );

  const loadOrders = useCallback(async function () {
    try {
      setStatus('loading');
      setError('');
      const nextOrders = await getAdminOrders(filters);
      setOrders(nextOrders);
      setSelectedOrder((current) => {
        if (!current) return nextOrders[0] || null;
        return nextOrders.find((order) => order.id === current.id) || nextOrders[0] || null;
      });
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [filters]);

  useEffect(
    function () {
      loadOrders();
    },
    [loadOrders],
  );

  useEffect(function () {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setPaymentProofPreview(null);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleStatusChange(order, nextStatus) {
    try {
      setError('');
      const updatedOrder = await updateAdminOrderStatus(order.id, nextStatus);
      setOrders((current) =>
        current.map((item) => (item.id === updatedOrder.id ? updatedOrder : item)),
      );
      setSelectedOrder(updatedOrder);
    } catch (err) {
      setError(err.message);
    }
  }

  async function acceptOrder(order) {
    if (!canAcceptOrder(order)) {
      setError('Verifica el pago antes de aceptar este pedido.');
      return;
    }

    await handleStatusChange(order, 'preparing');
  }

  async function cancelOrder(order) {
    await handleStatusChange(order, 'cancelled');
  }

  async function handlePaymentStatusChange(order, nextPaymentStatus) {
    try {
      setError('');
      const updatedOrder = await updateAdminPaymentStatus(
        order.id,
        nextPaymentStatus,
      );
      setOrders((current) =>
        current.map((item) => (item.id === updatedOrder.id ? updatedOrder : item)),
      );
      setSelectedOrder(updatedOrder);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="text-sm text-blue-500 hover:underline">
            &larr; Panel admin
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Pedidos</h1>
          <p className="text-sm text-stone-500">
            {orders.length} pedidos visibles, {totalPending} pendientes.
          </p>
          {totalPaymentReview > 0 && (
            <p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {totalPaymentReview} pagos por revisar antes de aceptar
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="rounded-full border border-stone-200 px-4 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {orderStatuses.map((item) => (
            <option value={item} key={item}>
              {formatOrderStatus(item)}
            </option>
          ))}
        </select>

        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          className="rounded-full border border-stone-200 px-4 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="true">Prioridad</option>
          <option value="false">Sin prioridad</option>
        </select>

        <select
          name="paymentStatus"
          value={filters.paymentStatus}
          onChange={handleFilterChange}
          className="rounded-full border border-stone-200 px-4 py-2 text-sm"
        >
          <option value="">Todos los pagos</option>
          {paymentStatuses.map((item) => (
            <option value={item} key={item}>
              {formatPaymentStatus(item)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="min-w-0">
          {status === 'loading' ? (
            <p className="text-sm text-stone-500">Cargando pedidos...</p>
          ) : (
            <>
              {orders.length === 0 && (
                <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-500">
                  No hay pedidos para los filtros seleccionados.
                </p>
              )}

              <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1 lg:hidden">
                {orders.map((order) => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                    isSelected={selectedOrder?.id === order.id}
                    onSelect={() => setSelectedOrder(order)}
                    onAccept={() => acceptOrder(order)}
                    onCancel={() => cancelOrder(order)}
                    onStatusChange={(nextStatus) =>
                      handleStatusChange(order, nextStatus)
                    }
                  />
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 pr-4">Pedido</th>
                  <th className="py-3 pr-4">Cliente</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Pago</th>
                  <th className="py-3 pr-4">Total</th>
                  <th className="py-3 pr-4">Fecha</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`cursor-pointer border-b align-top ${
                      selectedOrder?.id === order.id
                        ? 'bg-yellow-50'
                        : needsPaymentReview(order)
                          ? 'bg-amber-50/70'
                          : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3 pr-4">
                      <p className="font-semibold">{order.id}</p>
                      {order.priority && (
                        <span className="text-xs font-semibold uppercase text-red-600">
                          Prioridad
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-xs text-stone-500">{order.phone}</p>
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      <span
                        className={
                          order.status === 'pending'
                            ? 'text-yellow-700'
                            : order.status === 'cancelled'
                              ? 'text-red-600'
                              : 'text-stone-800'
                        }
                      >
                        {formatOrderStatus(order.status)}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">
                        {formatPaymentMethod(order.paymentMethod)}
                      </p>
                      <p
                        className={`text-xs ${
                          order.paymentStatus === 'verified'
                            ? 'text-green-700'
                            : order.paymentStatus === 'rejected'
                              ? 'text-red-600'
                              : needsPaymentReview(order)
                                ? 'font-semibold text-amber-700'
                                : 'text-stone-500'
                        }`}
                      >
                        {formatPaymentStatus(order.paymentStatus)}
                      </p>
                      {needsPaymentReview(order) && (
                        <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                          Revisar comprobante
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {formatCurrency(order.orderPrice + order.priorityPrice)}
                    </td>
                    <td className="py-3 pr-4">{formatDate(order.createdAt)}</td>
                    <td className="py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              disabled={!canAcceptOrder(order)}
                              onClick={(e) => {
                                e.stopPropagation();
                                acceptOrder(order);
                              }}
                              className={`font-semibold ${
                                canAcceptOrder(order)
                                  ? 'text-green-700 hover:underline'
                                  : 'cursor-not-allowed text-stone-400'
                              }`}
                            >
                              Aceptar
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelOrder(order);
                              }}
                              className="font-semibold text-red-600 hover:underline"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        <select
                          value={order.status}
                          disabled={availableOrderStatuses(order).length === 1}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          className="rounded-full border border-stone-200 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
                        >
                          {availableOrderStatuses(order).map((item) => (
                            <option value={item} key={item}>
                              {formatOrderStatus(item)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <aside className="rounded-md border border-stone-200 p-4">
          {selectedOrder ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Pedido {selectedOrder.id}</h2>
                <p className="text-sm text-stone-500">
                  {formatOrderStatus(selectedOrder.status)}
                </p>
                {selectedOrder.status === 'pending' && (
                  <>
                    {!canAcceptOrder(selectedOrder) && (
                      <p className="mt-3 rounded-md bg-yellow-100 p-3 text-xs text-yellow-800">
                        {needsPaymentReview(selectedOrder)
                          ? 'Este pedido tiene un comprobante por revisar. Verificalo antes de aceptarlo.'
                          : 'Verifica el pago antes de aceptar este pedido.'}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={!canAcceptOrder(selectedOrder)}
                        onClick={() => acceptOrder(selectedOrder)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase text-white ${
                          canAcceptOrder(selectedOrder)
                            ? 'bg-green-600 hover:bg-green-500'
                            : 'cursor-not-allowed bg-stone-300'
                        }`}
                      >
                        Aceptar pedido
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelOrder(selectedOrder)}
                        className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold uppercase text-white hover:bg-red-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <p className="font-semibold">{selectedOrder.customer}</p>
                <p>{selectedOrder.phone}</p>
                <p className="text-stone-600">{selectedOrder.address}</p>
                {selectedOrder.position && (
                  <a
                    href={selectedOrder.position}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Abrir ubicacion
                  </a>
                )}
              </div>

              <ul className="divide-y divide-stone-200 border-y">
                {selectedOrder.cart.map((item) => (
                  <OrderLineItem item={item} key={item.pizzaId} />
                ))}
              </ul>

              <div className="space-y-1 text-sm">
                <p>Pedido: {formatCurrency(selectedOrder.orderPrice)}</p>
                <p>Prioridad: {formatCurrency(selectedOrder.priorityPrice)}</p>
                <p className="font-bold">
                  Total:{' '}
                  {formatCurrency(
                    selectedOrder.orderPrice + selectedOrder.priorityPrice,
                  )}
                </p>
              </div>

              <div className="space-y-2 border-t border-stone-200 pt-4 text-sm">
                <p className="font-semibold">Pago</p>
                <p>Metodo: {formatPaymentMethod(selectedOrder.paymentMethod)}</p>
                <p>Estado: {formatPaymentStatus(selectedOrder.paymentStatus)}</p>
                {selectedOrder.paymentProofUrl && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentProofPreview({
                          orderId: selectedOrder.id,
                          url: selectedOrder.paymentProofUrl,
                        })
                      }
                      className="block w-full max-w-[180px] overflow-hidden rounded-md border border-stone-200 bg-stone-50 text-left"
                    >
                      <img
                        src={selectedOrder.paymentProofUrl}
                        alt={`Comprobante del pedido ${selectedOrder.id}`}
                        className="h-28 w-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentProofPreview({
                          orderId: selectedOrder.id,
                          url: selectedOrder.paymentProofUrl,
                        })
                      }
                      className="text-blue-600 hover:underline"
                    >
                      Ver comprobante
                    </button>
                  </div>
                )}
                {selectedOrder.paymentMethod === 'cash' &&
                  selectedOrder.cashAmount !== null && (
                    <>
                      <p>Paga con: {formatCurrency(selectedOrder.cashAmount)}</p>
                      <p>
                        Vuelto:{' '}
                        {formatCurrency(
                          selectedOrder.cashAmount -
                            (selectedOrder.orderPrice + selectedOrder.priorityPrice),
                        )}
                      </p>
                    </>
                  )}
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) =>
                    handlePaymentStatusChange(selectedOrder, e.target.value)
                  }
                  className="rounded-full border border-stone-200 px-3 py-2 text-xs"
                >
                  {paymentStatuses.map((item) => (
                    <option value={item} key={item}>
                      {formatPaymentStatus(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 border-t border-stone-200 pt-4 text-sm">
                <p className="font-semibold">Historial</p>
                {selectedOrder.events?.length ? (
                  <ol className="space-y-3">
                    {selectedOrder.events.map((event) => (
                      <li key={event.id} className="flex gap-3">
                        <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-stone-800" />
                        <div className="min-w-0">
                          <p className="font-semibold">{event.title}</p>
                          {event.description && (
                            <p className="text-stone-600">{event.description}</p>
                          )}
                          <p className="text-xs text-stone-400">
                            {formatDate(event.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-stone-500">
                    Este pedido todavia no tiene eventos registrados.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-500">Selecciona un pedido.</p>
          )}
        </aside>
      </div>

      {paymentProofPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Comprobante del pedido ${paymentProofPreview.orderId}`}
          onClick={() => setPaymentProofPreview(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-md bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <h2 className="font-semibold">
                Comprobante {paymentProofPreview.orderId}
              </h2>
              <button
                type="button"
                onClick={() => setPaymentProofPreview(null)}
                className="rounded-full px-3 py-1 text-sm font-semibold text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              >
                Cerrar
              </button>
            </div>
            <div className="max-h-[calc(90vh-56px)] overflow-auto bg-stone-100 p-4">
              <img
                src={paymentProofPreview.url}
                alt={`Comprobante del pedido ${paymentProofPreview.orderId}`}
                className="mx-auto max-h-[75vh] max-w-full rounded object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export async function loader() {
  try {
    const user = await getCurrentAdmin();
    if (!user) return redirect('/admin/login');

    return null;
  } catch {
    clearSession();
    return redirect('/admin/login');
  }
}

export default AdminOrders;
