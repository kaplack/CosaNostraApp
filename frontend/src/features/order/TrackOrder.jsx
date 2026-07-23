import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import { normalizeOrderId } from '../../utils/helpers';

function TrackOrder() {
  const error = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="cn-paper min-h-[560px] border-x-[3px] border-stone-950 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7261e]">¿Dónde está mi pizza?</p>
        <h1 className="cn-display mt-2 text-5xl uppercase italic leading-none sm:text-7xl">Sigue tu pedido</h1>
        <p className="mt-4 max-w-lg text-sm font-semibold leading-6 text-stone-600">Ingresa el código que recibiste al confirmar tu pedido.</p>

        <Form method="POST" className="mt-8 border-[4px] border-stone-950 bg-[#f9bd16] p-5 shadow-[7px_7px_0_#111312] sm:p-7">
          <label htmlFor="orderId" className="text-xs font-black uppercase tracking-[0.15em]">Código de pedido</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="relative grow">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl" />
              <input id="orderId" name="orderId" placeholder="Ej. CEE609" autoComplete="off" className="w-full border-[3px] border-stone-950 bg-[#fff8e8] py-3 pl-12 pr-4 font-black uppercase shadow-[3px_3px_0_#111312] focus:outline-none focus:ring-2 focus:ring-[#d7261e]" />
            </div>
            <button disabled={isSubmitting} type="submit" className="inline-flex items-center justify-center gap-2 border-[3px] border-stone-950 bg-stone-950 px-5 py-3 text-xs font-black uppercase text-yellow-300 shadow-[3px_3px_0_#d7261e] disabled:opacity-60">
              {isSubmitting ? 'Buscando' : 'Ver seguimiento'} <FiArrowRight />
            </button>
          </div>
          {error && <p className="mt-4 border-2 border-red-800 bg-red-100 p-3 text-xs font-bold text-red-700">{error}</p>}
        </Form>
      </div>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const orderId = normalizeOrderId(formData.get('orderId'));
  if (!orderId) return 'Ingresa el código de tu pedido.';
  return redirect(`/order/${orderId}`);
}

export default TrackOrder;
