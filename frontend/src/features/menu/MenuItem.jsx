import { useDispatch, useSelector } from 'react-redux';
import { FiPlus } from 'react-icons/fi';
import { formatCurrency } from '../../utils/helpers';
import { addItem, getCurrentQuantityById } from '../cart/cartSlice';
import UpdateItemQuantity from '../cart/UpdateItemQuantity';

function calculateSizedPrice(unitPrice, selectedSize) {
  if (!selectedSize) return unitPrice;

  return unitPrice * selectedSize.portionMultiplier + selectedSize.basePrice;
}

function MenuItem({ pizza, selectedSize }) {
  const { id, name, unitPrice, ingredients, soldOut, imageUrl } = pizza;
  const sizedPizzaId = selectedSize ? `menu-${id}-size-${selectedSize.id}` : id;
  const sizedPrice = calculateSizedPrice(unitPrice, selectedSize);
  const displayName = selectedSize ? `${name} ${selectedSize.name}` : name;

  const currentQuantity = useSelector(getCurrentQuantityById(sizedPizzaId));
  const dispatch = useDispatch();
  const isInCart = currentQuantity > 0;

  function handleAddToCart() {
    //console.log(id);
    const newItem = {
      pizzaId: sizedPizzaId,
      sourcePizzaId: id,
      name: displayName,
      baseName: name,
      size: selectedSize
        ? {
            id: selectedSize.id,
            name: selectedSize.name,
            diameterCm: selectedSize.diameterCm,
            slices: selectedSize.slices,
            portionMultiplier: selectedSize.portionMultiplier,
          }
        : null,
      quantity: 1,
      unitPrice: sizedPrice,
      totalPrice: sizedPrice,
    };
    dispatch(addItem(newItem));
  }

  return (
    <li className="flex gap-3 py-3 sm:gap-4">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={`h-24 w-24 shrink-0 object-cover ${soldOut ? 'opacity-70 grayscale' : ''}`}
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-stone-200 text-xs text-stone-500">
          Sin foto
        </div>
      )}
      <div className="flex grow flex-col pt-0.5">
        <p className="font-medium">{name}</p>
        <p className="line-clamp-2 text-xs capitalize italic leading-snug text-stone-500">
          {ingredients.join(', ')}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3">
          {!soldOut ? (
            <div className="shrink-0">
              <p className="text-sm">{formatCurrency(sizedPrice)}</p>
              {selectedSize && (
                <p className="text-[10px] uppercase text-stone-400">
                  {selectedSize.name}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium uppercase text-stone-500">
              Agotada
            </p>
          )}

          {isInCart && (
            <div className="flex shrink-0 items-center gap-2">
              <UpdateItemQuantity
                pizzaId={sizedPizzaId}
                currentQuantity={currentQuantity}
              />
            </div>
          )}

          {!soldOut && !isInCart && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-stone-900 transition hover:bg-yellow-300"
              aria-label={`Agregar ${name} al carrito`}
              title="Agregar al carrito"
            >
              <FiPlus aria-hidden="true" className="text-base" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export default MenuItem;
