import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function EmptyCart() {
  return (
    <div className="cn-paper min-h-[520px] border-x-[3px] border-stone-950 px-5 py-10 sm:px-10">
      <Link to="/menu" className="inline-flex items-center gap-2 text-xs font-black uppercase hover:text-[#d7261e]"><FiArrowLeft /> Volver a la carta</Link>
      <div className="mx-auto mt-16 max-w-xl border-[4px] border-stone-950 bg-[#f9bd16] p-8 text-center shadow-[8px_8px_0_#111312]">
        <FiShoppingCart className="mx-auto text-5xl" />
        <h1 className="cn-display mt-4 text-4xl uppercase italic">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm font-semibold">Agrega una pizza de la carta o crea una completamente a tu manera.</p>
        <Link to="/menu" className="mt-6 inline-flex border-[3px] border-stone-950 bg-stone-950 px-5 py-3 text-sm font-black uppercase text-yellow-300">Ver carta</Link>
      </div>
    </div>
  );
}

export default EmptyCart;
