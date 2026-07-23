import { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiCheck, FiClock, FiCopy } from 'react-icons/fi';
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

const statusStyles = {
  pending: 'bg-[#f9bd16] text-stone-950',
  preparing: 'bg-[#1779a8] text-white',
  on_the_way: 'bg-[#1779a8] text-white',
  delivered: 'bg-green-500 text-white',
  cancelled: 'bg-[#d7261e] text-white',
};

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
    id, status, priority, priorityPrice, orderPrice, estimatedDelivery,
    paymentMethod, paymentStatus, cashAmount, cart, events = [],
  } = order;
  const deliveryIn = calcMinutesLeft(estimatedDelivery);
  const isPending = status === 'pending';
  const totalPrice = orderPrice + priorityPrice;
  const isPaymentPendingReview = paymentMethod !== 'cash' && paymentStatus === 'pending_review';
  const whatsappText = encodeURIComponent(`Hola, tengo una consulta sobre mi pedido ${id}.`);
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
    <div className="cn-paper min-h-full border-x-[3px] border-stone-950 px-4 py-8 sm:px-8 lg:px-12">
      <section className="relative overflow-hidden border-b-[4px] border-stone-950 pb-6">
        <div className="cn-halftone-blue absolute right-0 top-0 h-32 w-32 opacity-50" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7261e]">Pedido recibido</p>
        <div className="relative mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="cn-display text-5xl uppercase italic leading-none sm:text-7xl">Pedido {id}</h1>
            <button type="button" onClick={handleCopyOrderId} className="mt-3 inline-flex items-center gap-2 border-2 border-stone-950 bg-[#fff8e8] px-3 py-2 text-xs font-black uppercase shadow-[2px_2px_0_#111312]">
              {copyStatus === 'copied' ? <FiCheck /> : <FiCopy />}
              {copyStatus === 'copied' ? 'Código copiado' : copyStatus === 'error' ? 'No se pudo copiar' : 'Copiar código'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {priority && <span className="border-[3px] border-stone-950 bg-[#d7261e] px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#111312]">Prioridad</span>}
            <span className={`border-[3px] border-stone-950 px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#111312] ${statusStyles[status] || 'bg-stone-950 text-white'}`}>{formatOrderStatus(status)}</span>
          </div>
        </div>
      </section>

      <section className="mt-6 flex flex-col justify-between gap-4 border-[3px] border-stone-950 bg-[#f9bd16] p-5 shadow-[5px_5px_0_#111312] sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <FiClock className="mt-1 shrink-0 text-2xl" />
          <div>
            <p className="font-black">
              {isPaymentPendingReview
                ? 'Recibimos tu comprobante. Lo revisaremos antes de aceptar el pedido.'
                : isPending
                  ? 'Recibimos tu pedido. Lo confirmaremos antes de prepararlo.'
                  : deliveryIn >= 0
                    ? `Faltan aproximadamente ${deliveryIn} minutos`
                    : 'El pedido ya debería haber llegado'}
            </p>
            {!isPending && <p className="mt-1 text-xs font-semibold">Entrega estimada: {formatDate(estimatedDelivery)}</p>}
          </div>
        </div>
        {isPending && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span>Urgente: {WHATSAPP_PHONE_DISPLAY}</span>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-2 border-stone-950 bg-green-500 px-3 py-2 font-black text-white shadow-[2px_2px_0_#111312]">
              <FaWhatsapp /> WhatsApp
            </a>
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
        <section className="border-[3px] border-stone-950 bg-[#fff8e8] p-5 shadow-[4px_4px_0_#111312]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d7261e]">Información</p>
          <h2 className="cn-display mt-1 text-3xl uppercase">Pago</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between gap-4 border-b-2 border-stone-200 pb-2"><dt className="font-bold">Método</dt><dd>{formatPaymentMethod(paymentMethod)}</dd></div>
            <div className="flex justify-between gap-4 border-b-2 border-stone-200 pb-2"><dt className="font-bold">Estado</dt><dd>{formatPaymentStatus(paymentStatus)}</dd></div>
            {paymentMethod === 'cash' && cashAmount !== null && (
              <>
                <div className="flex justify-between gap-4"><dt className="font-bold">Paga con</dt><dd>{formatCurrency(cashAmount)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="font-bold">Vuelto</dt><dd>{formatCurrency(cashAmount - totalPrice)}</dd></div>
              </>
            )}
          </dl>
        </section>

        <section className="border-[3px] border-stone-950 bg-[#fff8e8] p-5 shadow-[4px_4px_0_#111312]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1779a8]">En tiempo real</p>
          <h2 className="cn-display mt-1 text-3xl uppercase">Seguimiento</h2>
          {events.length ? (
            <ol className="relative mt-5 space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-[3px] before:bg-stone-950">
              {events.map((event, index) => (
                <li key={event.id} className="relative flex gap-4">
                  <span className={`relative z-10 mt-1 h-4 w-4 flex-none rounded-full border-[3px] border-stone-950 ${index === events.length - 1 ? 'bg-[#f9bd16]' : 'bg-[#fff8e8]'}`} />
                  <div>
                    <p className="text-sm font-black">{event.title}</p>
                    {event.description && <p className="text-sm text-stone-600">{event.description}</p>}
                    <p className="mt-1 text-[10px] font-bold uppercase text-stone-400">{formatDate(event.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-stone-500">Estamos preparando el seguimiento de este pedido.</p>
          )}
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between border-b-[4px] border-stone-950 pb-2">
          <h2 className="cn-display text-3xl uppercase">Tu orden</h2>
          <p className="text-xs font-black uppercase">{cart.length} {cart.length === 1 ? 'producto' : 'productos'}</p>
        </div>
        <ul className="grid gap-3">
          {cart.map((item) => {
            const menuItem = fetcher.data?.find((it) => it.id === (item.sourcePizzaId || item.pizzaId));
            return <OrderItem item={item} key={item.pizzaId} isLoadingIngredients={fetcher.state === 'loading'} ingredients={menuItem?.ingredients} />;
          })}
        </ul>
      </section>

      <section className="mt-8 flex flex-col gap-2 border-[4px] border-stone-950 bg-stone-950 p-5 text-white shadow-[6px_6px_0_#d7261e] sm:ml-auto sm:max-w-md">
        <p className="flex justify-between gap-4 text-sm"><span>Precio del pedido</span><strong>{formatCurrency(orderPrice)}</strong></p>
        {priority && <p className="flex justify-between gap-4 text-sm"><span>Prioridad</span><strong>{formatCurrency(priorityPrice)}</strong></p>}
        <p className="mt-2 flex justify-between gap-4 border-t-2 border-[#f9bd16] pt-3 text-lg font-black text-[#f9bd16]"><span>Total a pagar</span><span>{formatCurrency(totalPrice)}</span></p>
      </section>
    </div>
  );
}

export async function loader({ params }) {
  return getOrder(params.orderId);
}

export default Order;
