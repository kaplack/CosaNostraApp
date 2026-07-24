import { useDispatch } from 'react-redux';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { getCommunityPizzas } from '../../services/apiCommunity';
import { addItem } from '../cart/cartSlice';
import CommunityPizzaCard from './CommunityPizzaCard';
import { createSharedPizzaCartItem } from './sharedPizza';

function Community() {
  const pizzas = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function orderPizza(pizza) {
    dispatch(addItem(createSharedPizzaCartItem(pizza, pizza.creator)));
    navigate('/cart');
  }

  return (
    <div className="cn-paper min-h-full border-x-[3px] border-stone-950">
      <section className="relative overflow-hidden border-b-[5px] border-stone-950 bg-[#d7261e] px-5 py-12 text-white sm:px-10 lg:px-16">
        <div className="cn-halftone-blue absolute -right-8 -top-12 h-64 w-64 opacity-70" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f9bd16]">Hechas por nuestros clientes</p>
          <h1 className="cn-display mt-2 max-w-4xl text-6xl uppercase italic leading-[0.85] drop-shadow-[5px_5px_0_#111312] sm:text-8xl">Pizzas del barrio</h1>
          <p className="mt-5 max-w-xl text-sm font-semibold leading-6">Descubre recetas creadas por la comunidad, conoce a sus autores y pide la que más te provoque.</p>
          <Link to="/builder" className="mt-6 inline-flex items-center gap-2 border-[3px] border-stone-950 bg-[#f9bd16] px-5 py-3 text-xs font-black uppercase text-stone-950 shadow-[4px_4px_0_#111312]">
            Crea la tuya <FiArrowRight />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-10 lg:px-12">
        {pizzas.length === 0 ? (
          <div className="border-[3px] border-stone-950 bg-white p-7 text-sm font-semibold shadow-[5px_5px_0_#111312]">Todavía no hay pizzas públicas. ¡Sé el primero en compartir la tuya!</div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {pizzas.map((pizza, index) => <CommunityPizzaCard key={pizza.id} pizza={pizza} onOrder={orderPizza} featured={index % 3 === 1} />)}
          </div>
        )}
      </section>
    </div>
  );
}

export async function loader() {
  return getCommunityPizzas();
}

export default Community;
