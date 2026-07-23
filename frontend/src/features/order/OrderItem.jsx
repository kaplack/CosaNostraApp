import { formatCurrency } from '../../utils/helpers';

function OrderItem({ item, isLoadingIngredients, ingredients }) {
  const { quantity, name, totalPrice, customRecipe, size } = item;

  return (
    <li className="space-y-1 border-[3px] border-stone-950 bg-[#fff8e8] p-4 shadow-[3px_3px_0_#111312]">
      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="cn-display text-xl uppercase"><span className="text-[#d7261e]">{quantity}&times;</span> {name}</p>
        <p className="font-black text-[#d7261e]">{formatCurrency(totalPrice)}</p>
      </div>
      {customRecipe ? (
        <div className="space-y-1 text-sm text-stone-500">
          <p>
            {customRecipe.size.name} / {customRecipe.size.diameterCm} cm /{' '}
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
      ) : (
        <>
          {size && (
            <p className="text-sm text-stone-500">
              {size.diameterCm} cm / {size.slices} tajadas
            </p>
          )}
          <p className="text-sm capitalize italic text-stone-500">
            {isLoadingIngredients
              ? 'Cargando ingredientes...'
              : ingredients?.join(', ')}
          </p>
        </>
      )}
    </li>
  );
}

export default OrderItem;
