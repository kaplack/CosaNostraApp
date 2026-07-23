import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiShoppingCart } from 'react-icons/fi';
import { formatCurrency } from '../../utils/helpers';
import { addItem, getCurrentQuantityById } from '../cart/cartSlice';
import UpdateItemQuantity from '../cart/UpdateItemQuantity';
import PizzaImageModal from './PizzaImageModal';

function calculateSizedPrice(unitPrice, selectedSize) {
  if (!selectedSize) return unitPrice;
  return unitPrice * selectedSize.portionMultiplier + selectedSize.basePrice;
}

function MenuItem({ pizza, selectedSize, index }) {
  const { id, name, unitPrice, ingredients, soldOut, imageUrl } = pizza;
  const sizedPizzaId = selectedSize ? `menu-${id}-size-${selectedSize.id}` : id;
  const sizedPrice = calculateSizedPrice(unitPrice, selectedSize);
  const displayName = selectedSize ? `${name} ${selectedSize.name}` : name;
  const currentQuantity = useSelector(getCurrentQuantityById(sizedPizzaId));
  const dispatch = useDispatch();
  const isInCart = currentQuantity > 0;
  const [isImageOpen, setIsImageOpen] = useState(false);

  function handleAddToCart() {
    dispatch(
      addItem({
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
      }),
    );
  }

  return (
    <li className={`relative grid min-h-[158px] grid-cols-[38%_1fr] overflow-hidden border-[4px] border-stone-950 bg-[#fff8e8] shadow-[4px_4px_0_#111312] sm:flex sm:min-h-full sm:flex-col sm:shadow-[5px_5px_0_#111312] ${index % 3 === 1 ? 'lg:translate-y-3 lg:rotate-1' : index % 3 === 2 ? 'lg:-rotate-1' : 'lg:rotate-[-0.5deg]'}`}>
      {index === 0 && !soldOut && (
        <span className="absolute left-0 top-2 z-10 bg-[#f9bd16] px-2 py-1 text-[9px] font-black uppercase text-stone-950 shadow-[2px_2px_0_#111312] sm:top-4 sm:px-4 sm:text-xs sm:shadow-[3px_3px_0_#111312]">Favorita</span>
      )}

      {imageUrl ? (
        <button
          type="button"
          onClick={() => setIsImageOpen(true)}
          className="group relative min-h-[105px] cursor-zoom-in overflow-hidden border-r-[4px] border-stone-950 text-left sm:h-60 sm:min-h-0 sm:border-b-[4px] sm:border-r-0"
          aria-label={`Ampliar foto de ${name}`}
        >
          <img src={imageUrl} alt={name} className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${soldOut ? 'grayscale' : ''}`} />
        </button>
      ) : (
        <div className="flex min-h-[105px] items-center justify-center border-r-[4px] border-stone-950 bg-[#f2e5ce] text-xs font-black uppercase text-stone-600 sm:h-60 sm:min-h-0 sm:border-b-[4px] sm:border-r-0 sm:text-sm">Sin foto</div>
      )}

      <div className="min-w-0 p-3 sm:grow sm:p-5 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="cn-display text-2xl uppercase italic leading-none text-stone-950 sm:text-3xl">{name}</h2>
          {soldOut && <span className="rotate-3 bg-stone-950 px-2 py-1 text-[8px] font-black uppercase text-white sm:text-[10px]">Agotada</span>}
        </div>
        <p className="mt-2 line-clamp-2 text-xs capitalize leading-4 text-stone-600 sm:mt-3 sm:text-sm sm:leading-5">{ingredients.join(', ')}</p>
      </div>

      <div className="col-span-2 flex min-h-12 items-center justify-between gap-3 border-t-[3px] border-stone-950 bg-[#fff8e8] px-3 py-2 sm:mt-auto sm:px-5 sm:py-4">
        {!soldOut ? (
          <div className="min-w-0">
            <p className="text-base font-black leading-none text-[#d7261e] sm:text-xl">{formatCurrency(sizedPrice)}</p>
            {selectedSize && <p className="mt-1 text-[8px] font-black uppercase tracking-wide text-stone-500 sm:text-[10px]">{selectedSize.name} · {selectedSize.diameterCm} cm</p>}
          </div>
        ) : (
          <p className="text-xs font-black uppercase text-stone-500">No disponible</p>
        )}

        {isInCart && !soldOut && (
          <div className="shrink-0 border-2 border-stone-950 bg-[#f9bd16] p-1 shadow-[2px_2px_0_#111312]">
            <UpdateItemQuantity pizzaId={sizedPizzaId} currentQuantity={currentQuantity} />
          </div>
        )}

        {!soldOut && !isInCart && (
          <button type="button" onClick={handleAddToCart} className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-[3px] border-stone-950 bg-[#d7261e] text-xs font-black uppercase text-white shadow-[2px_2px_0_#111312] transition hover:-translate-y-1 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:shadow-[3px_3px_0_#111312]" aria-label={`Agregar ${name} al carrito`}>
            <FiPlus aria-hidden="true" className="text-lg sm:hidden" />
            <span className="hidden sm:inline">Agregar</span><FiShoppingCart aria-hidden="true" className="hidden text-base sm:block" />
          </button>
        )}
      </div>

      {isImageOpen && (
        <PizzaImageModal imageUrl={imageUrl} name={name} onClose={() => setIsImageOpen(false)} />
      )}
    </li>
  );
}

export default MenuItem;
