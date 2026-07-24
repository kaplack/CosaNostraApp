import { useDispatch } from 'react-redux';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiShoppingCart, FiUser } from 'react-icons/fi';
import { getPublicPizza } from '../../services/apiCommunity';
import { formatCurrency } from '../../utils/helpers';
import { addItem } from '../cart/cartSlice';
import PizzaRecipePreview from './PizzaRecipePreview';
import { createSharedPizzaCartItem } from './sharedPizza';

function PublicPizza() {
  const pizza = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function orderSharedPizza() {
    dispatch(addItem(createSharedPizzaCartItem(pizza, pizza.creator)));
    navigate('/cart');
  }

  return (
    <div className="cn-paper min-h-full border-x-[3px] border-stone-950 px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link to="/builder" className="text-xs font-black uppercase text-[#1779a8] underline">← Crea la tuya</Link>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative border-[4px] border-stone-950 bg-[#f9bd16] p-5 shadow-[8px_8px_0_#111312] sm:p-8">
            <div className="absolute left-4 top-4 z-10 border-2 border-stone-950 bg-[#d7261e] px-3 py-1 text-[10px] font-black uppercase text-white">Creación de la comunidad</div>
            <PizzaRecipePreview recipe={pizza.recipe} className="max-w-[560px]" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7261e]">Pizza original</p>
            <h1 className="cn-display mt-2 text-5xl uppercase italic leading-[0.85] sm:text-7xl">{pizza.name}</h1>
            <Link to={`/creadores/${pizza.creator.slug}`} className="mt-5 inline-flex items-center gap-2 border-2 border-stone-950 bg-white px-3 py-2 text-xs font-black uppercase transition hover:bg-[#f9bd16]">
              <FiUser /> Creada por {pizza.creator.publicName}
            </Link>
            <p className="mt-5 text-sm font-semibold text-stone-600">
              {pizza.recipe.size.name} · {pizza.recipe.size.diameterCm} cm · {pizza.recipe.size.slices} tajadas
            </p>
            <p className="mt-2 text-3xl font-black text-[#d7261e]">{formatCurrency(pizza.estimatedPrice)}</p>

            <ul className="mt-6 divide-y-2 divide-stone-300 border-y-2 border-stone-950 text-sm">
              {pizza.recipe.items.map((item) => (
                <li key={`${item.ingredientId}-${item.area}`} className="flex justify-between gap-3 py-3">
                  <span className="font-black uppercase">{item.name} × {item.portions}</span>
                  <span className="text-right text-xs font-semibold text-stone-500">{item.areaLabel} · {item.totalQuantity} {item.unit}</span>
                </li>
              ))}
            </ul>

            <button type="button" onClick={orderSharedPizza} className="cn-shadow mt-7 inline-flex w-full items-center justify-center gap-3 border-[3px] border-stone-950 bg-[#f9bd16] px-6 py-4 text-sm font-black uppercase transition hover:-translate-y-1">
              <FiShoppingCart /> Pedir esta pizza <FiArrowRight />
            </button>
            <p className="mt-3 text-xs font-semibold text-stone-500">Puedes pedirla como invitado. La receta se agregará a tu carrito tal como fue creada.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function loader({ params }) {
  return getPublicPizza(params.slug);
}

export default PublicPizza;
