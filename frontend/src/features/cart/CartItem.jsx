//import { useSelector } from 'react-redux';
import { formatCurrency } from '../../utils/helpers';
import UpdateItemQuantity from './UpdateItemQuantity';

function CartItem({ item }) {
  const { pizzaId, name, quantity, totalPrice, customRecipe, size } = item;
  //const currentQuantity = useSelector(get)

  return (
    <li className="border-[3px] border-stone-950 bg-[#fff8e8] p-4 shadow-[4px_4px_0_#111312] sm:flex sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="cn-display mb-1 text-2xl uppercase leading-none sm:mb-0">{name}</p>
        {!customRecipe && size && (
          <p className="text-xs text-stone-500">
            {size.diameterCm} cm / {size.slices} tajadas
          </p>
        )}
        {customRecipe && (
          <div className="mt-2 space-y-1 text-xs text-stone-500">
            <p>
              {item.baseName && item.savedPizzaName ? `${item.baseName} / ` : ''}
              {customRecipe.size.diameterCm} cm /{' '}
              {customRecipe.size.slices} tajadas
            </p>
            <ul className="space-y-1">
              {customRecipe.items.map((recipeItem) => (
                <li key={`${recipeItem.ingredientId}-${recipeItem.area}`}>
                  <span className="font-semibold text-stone-700">
                    {recipeItem.name} x{recipeItem.portions} -{' '}
                    {recipeItem.areaLabel}
                  </span>
                  <span>
                    {' '}
                    ({recipeItem.totalQuantity} {recipeItem.unit})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between sm:mt-0 sm:gap-6">
        <p className="text-base font-black text-[#d7261e]">{formatCurrency(totalPrice)}</p>
        <div className="border-2 border-stone-950 bg-[#f9bd16] p-1 shadow-[2px_2px_0_#111312]">
          <UpdateItemQuantity pizzaId={pizzaId} currentQuantity={quantity} />
        </div>
      </div>
    </li>
  );
}

export default CartItem;
