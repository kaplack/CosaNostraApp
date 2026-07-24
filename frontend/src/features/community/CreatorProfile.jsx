import { useDispatch } from 'react-redux';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiShoppingCart, FiUser } from 'react-icons/fi';
import { getPublicCreator } from '../../services/apiCommunity';
import { formatCurrency } from '../../utils/helpers';
import { addItem } from '../cart/cartSlice';
import PizzaRecipePreview from './PizzaRecipePreview';
import { createSharedPizzaCartItem } from './sharedPizza';

function CreatorProfile() {
  const { creator, pizzas } = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function orderPizza(pizza) {
    dispatch(addItem(createSharedPizzaCartItem(pizza, creator)));
    navigate('/cart');
  }

  return (
    <div className="cn-paper min-h-full border-x-[3px] border-stone-950">
      <section className="relative overflow-hidden border-b-[5px] border-stone-950 bg-[#f9bd16] px-5 py-10 sm:px-10 lg:px-16">
        <div className="absolute -right-12 -top-16 h-48 w-48 rotate-12 bg-[#d7261e]" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em]">Creador de la comunidad</p>
            <h1 className="cn-display mt-2 text-5xl uppercase italic leading-none sm:text-7xl">{creator.publicName}</h1>
            <div className="mt-4 inline-flex items-center gap-2 border-2 border-stone-950 bg-[#fff8e8] px-3 py-2 text-xs font-black uppercase">
              <FiUser /> Perfil público
            </div>
          </div>
          <div className="relative border-[3px] border-stone-950 bg-[#fff8e8] px-5 py-3 text-center shadow-[5px_5px_0_#111312]">
            <p className="cn-display text-4xl text-[#d7261e]">{pizzas.length}</p>
            <p className="text-[10px] font-black uppercase">{pizzas.length === 1 ? 'Pizza publicada' : 'Pizzas publicadas'}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-10 lg:px-12">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d7261e]">Recetas originales</p>
            <h2 className="cn-display mt-1 text-4xl uppercase italic sm:text-5xl">Sus creaciones</h2>
          </div>
          <Link to="/builder" className="inline-flex items-center gap-2 border-2 border-stone-950 bg-[#f9bd16] px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#111312]">
            Crea la tuya <FiArrowRight />
          </Link>
        </div>

        {pizzas.length === 0 ? (
          <div className="border-[3px] border-stone-950 bg-white p-6 text-sm font-semibold shadow-[5px_5px_0_#111312]">
            Este creador no tiene pizzas públicas por ahora.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pizzas.map((pizza, index) => (
              <article key={pizza.id} className={`overflow-hidden border-[4px] border-stone-950 bg-[#fff8e8] shadow-[6px_6px_0_#111312] ${index % 3 === 1 ? 'lg:-translate-y-2 lg:rotate-1' : ''}`}>
                <div className="relative border-b-[3px] border-stone-950 bg-[#f9bd16] p-4">
                  <PizzaRecipePreview recipe={pizza.recipe} className="max-w-[280px]" />
                </div>
                <div className="p-4">
                  <h3 className="cn-display text-3xl uppercase italic leading-none">{pizza.name}</h3>
                  <p className="mt-2 text-xs font-semibold text-stone-500">{pizza.recipe.size.name} · {pizza.recipe.size.diameterCm} cm</p>
                  <p className="mt-3 text-xl font-black text-[#d7261e]">{formatCurrency(pizza.estimatedPrice)}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link to={`/p/${pizza.slug}`} className="grid place-items-center border-2 border-stone-950 bg-white px-3 py-2 text-center text-[10px] font-black uppercase">Ver pizza</Link>
                    <button type="button" onClick={() => orderPizza(pizza)} className="inline-flex items-center justify-center gap-1 border-2 border-stone-950 bg-[#d7261e] px-3 py-2 text-[10px] font-black uppercase text-white">
                      <FiShoppingCart /> Pedir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export async function loader({ params }) {
  return getPublicCreator(params.slug);
}

export default CreatorProfile;
