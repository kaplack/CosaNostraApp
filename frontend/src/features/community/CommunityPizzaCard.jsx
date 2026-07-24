import { FiArrowRight, FiShoppingCart, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';
import PizzaRecipePreview from './PizzaRecipePreview';

function CommunityPizzaCard({ pizza, onOrder, featured = false }) {
  return (
    <article className={`overflow-hidden border-[4px] border-stone-950 bg-[#fff8e8] shadow-[6px_6px_0_#111312] ${featured ? 'md:-translate-y-2 md:rotate-1' : ''}`}>
      <Link to={`/p/${pizza.slug}`} className="block border-b-[3px] border-stone-950 bg-[#f9bd16] p-4 transition hover:bg-yellow-300">
        <PizzaRecipePreview recipe={pizza.recipe} className="max-w-[280px]" />
      </Link>
      <div className="p-4">
        <h3 className="cn-display text-3xl uppercase italic leading-none">{pizza.name}</h3>
        <Link to={`/creadores/${pizza.creator.slug}`} className="mt-2 inline-flex items-center gap-2 text-xs font-black uppercase text-stone-600 hover:text-[#d7261e]">
          <FiUser /> Por {pizza.creator.publicName}
        </Link>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase text-stone-500">{pizza.recipe.size.name} · {pizza.recipe.size.diameterCm} cm</p>
            <p className="mt-1 text-xl font-black text-[#d7261e]">{formatCurrency(pizza.estimatedPrice)}</p>
          </div>
          <Link to={`/p/${pizza.slug}`} aria-label={`Ver ${pizza.name}`} className="grid h-10 w-10 place-items-center border-2 border-stone-950 bg-white text-lg">
            <FiArrowRight />
          </Link>
        </div>
        {onOrder && (
          <button type="button" onClick={() => onOrder(pizza)} className="mt-4 inline-flex w-full items-center justify-center gap-2 border-2 border-stone-950 bg-[#d7261e] px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0_#111312]">
            <FiShoppingCart /> Pedir esta pizza
          </button>
        )}
      </div>
    </article>
  );
}

export default CommunityPizzaCard;
