//import { useSelector } from 'react-redux';
import { formatCurrency } from '../../utils/helpers';
import UpdateItemQuantity from './UpdateItemQuantity';

function CartItem({ item }) {
  const { pizzaId, name, quantity, totalPrice, customRecipe, size } = item;
  //const currentQuantity = useSelector(get)

  return (
    <li className="py-3 sm:flex sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="mb-1 sm:mb-0">
          {quantity}&times; {name}
        </p>
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
        <p className="text-sm font-bold">{formatCurrency(totalPrice)}</p>
        <UpdateItemQuantity pizzaId={pizzaId} currentQuantity={quantity} />
      </div>
    </li>
  );
}

export default CartItem;
