import { useEffect, useState } from 'react';
import { FiCopy } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useFetcher, useLoaderData } from 'react-router-dom';
import { getOrder } from '../../services/apiRestaurant';
import {
  calcMinutesLeft,
  formatCurrency,
  formatDate,
  formatOrderStatus,
  formatPaymentMethod,
  formatPaymentStatus,
} from '../../utils/helpers';
import OrderItem from './OrderItem';

const WHATSAPP_PHONE_DISPLAY = '901 686 547';
const WHATSAPP_PHONE_LINK = '51901686547';

function Order() {
  const order = useLoaderData();
  const fetcher = useFetcher();
  const [copyStatus, setCopyStatus] = useState('idle');

  useEffect(
    function () {
      if (!fetcher.data && fetcher.state === 'idle') fetcher.load('/menu');
    },
    [fetcher],
  );

  const {
    id,
    status,
    priority,
    priorityPrice,
    orderPrice,
    estimatedDelivery,
    paymentMethod,
    paymentStatus,
    cashAmount,
    cart,
    events = [],
  } = order;
  const deliveryIn = calcMinutesLeft(estimatedDelivery);
  const isPending = status === 'pending';
  const totalPrice = orderPrice + priorityPrice;
  const isPaymentPendingReview =
    paymentMethod !== 'cash' && paymentStatus === 'pending_review';
  const whatsappText = encodeURIComponent(
    `Hola, tengo una consulta sobre mi pedido ${id}.`,
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_LINK}?text=${whatsappText}`;

  async function handleCopyOrderId() {
    try {
      await navigator.clipboard.writeText(id);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 1800);
    } catch {
      setCopyStatus('error');
      window.setTimeout(() => setCopyStatus('idle'), 1800);
    }
  }

  return (
    <div className="space-y-8 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Estado del pedido {id}</h2>
          <button
            type="button"
            onClick={handleCopyOrderId}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-200"
          >
            <FiCopy aria-hidden="true" />
            {copyStatus === 'copied'
              ? 'Codigo copiado'
              : copyStatus === 'error'
                ? 'No se pudo copiar'
                : 'Copiar codigo'}
          </button>
        </div>

        <div className="space-x-2">
          {priority && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-red-50">
              Prioridad
            </span>
          )}
          <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-green-50">
            {formatOrderStatus(status)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-200 px-6 py-5">
        <p className="font-medium">
          {isPaymentPendingReview
            ? 'Recibimos tu comprobante. Lo revisaremos antes de aceptar el pedido.'
            : isPending
            ? 'Recibimos tu pedido. Lo confirmaremos antes de prepararlo.'
            : deliveryIn >= 0
              ? `Faltan aproximadamente ${deliveryIn} minutos`
              : 'El pedido ya deberia haber llegado'}
        </p>
        {isPending ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
            <span>Urgente: {WHATSAPP_PHONE_DISPLAY}</span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-green-500 px-3 py-2 font-semibold text-white transition hover:bg-green-600"
            >
              <FaWhatsapp aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        ) : (
          <p className="text-xs text-stone-500">
            Entrega estimada: {formatDate(estimatedDelivery)}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-2 rounded-md border border-stone-200 p-4">
          <h3 className="font-semibold">Pago</h3>
          <p className="text-sm text-stone-600">
            Metodo: {formatPaymentMethod(paymentMethod)}
          </p>
          <p className="text-sm text-stone-600">
            Estado: {formatPaymentStatus(paymentStatus)}
          </p>
          {paymentMethod === 'cash' && cashAmount !== null && (
            <>
              <p className="text-sm text-stone-600">
                Paga con: {formatCurrency(cashAmount)}
              </p>
              <p className="text-sm text-stone-600">
                Vuelto estimado: {formatCurrency(cashAmount - totalPrice)}
              </p>
            </>
          )}
        </div>

        <div className="rounded-md border border-stone-200 p-4">
          <h3 className="mb-3 font-semibold">Seguimiento</h3>
          {events.length ? (
            <ol className="space-y-3">
              {events.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-yellow-500" />
                  <div>
                    <p className="text-sm font-semibold">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-stone-600">
                        {event.description}
                      </p>
                    )}
                    <p className="text-xs text-stone-400">
                      {formatDate(event.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-stone-500">
              Estamos preparando el seguimiento de este pedido.
            </p>
          )}
        </div>
      </div>

      <ul className="divide-y divide-stone-200 border-b border-t">
        {cart.map((item) => {
          const menuItem = fetcher.data?.find(
            (it) => it.id === (item.sourcePizzaId || item.pizzaId),
          );

          return (
            <OrderItem
              item={item}
              key={item.pizzaId}
              isLoadingIngredients={fetcher.state === 'loading'}
              ingredients={menuItem?.ingredients}
            />
          );
        })}
      </ul>

      <div className="space-y-2 bg-stone-200 px-6 py-5">
        <p className="text-sm font-medium text-stone-600">
          Precio del pedido: {formatCurrency(orderPrice)}
        </p>
        {priority && (
          <p className="text-sm font-medium text-stone-600">
            Prioridad: {formatCurrency(priorityPrice)}
          </p>
        )}
        <p className="font-bold">
          Total a pagar: {formatCurrency(totalPrice)}
        </p>
      </div>
    </div>
  );
}

export async function loader({ params }) {
  const order = await getOrder(params.orderId);
  return order;
}

export default Order;
