import { useEffect, useState } from 'react';
import { Link, redirect, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  deleteMySavedPizza,
  getMySavedPizzas,
} from '../../services/apiCustomerPizzas';
import { getCurrentCustomer } from '../../services/apiCustomerAuth';
import { addItem } from '../cart/cartSlice';
import { formatCurrency } from '../../utils/helpers';

function createCartItemFromSavedPizza(savedPizza) {
  return {
    pizzaId: `custom-${savedPizza.id}-${Date.now()}`,
    isCustom: true,
    savedPizzaId: savedPizza.id,
    savedPizzaName: savedPizza.name,
    name: savedPizza.name,
    baseName: savedPizza.baseName,
    quantity: 1,
    unitPrice: savedPizza.estimatedPrice,
    totalPrice: savedPizza.estimatedPrice,
    customRecipe: savedPizza.recipe,
  };
}

function formatRecipeQuantity(recipeItem) {
  const value = Number(recipeItem.totalQuantity);
  const quantity = Number.isInteger(value) ? String(value) : value.toFixed(2);

  return `${quantity} ${recipeItem.unit}`;
}

function CustomerSavedPizzas() {
  const [pizzas, setPizzas] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(function () {
    loadPizzas();
  }, []);

  async function loadPizzas() {
    try {
      setStatus('loading');
      setError('');
      setPizzas(await getMySavedPizzas());
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  function addSavedPizzaToCart(savedPizza) {
    dispatch(addItem(createCartItemFromSavedPizza(savedPizza)));
    navigate('/cart');
  }

  async function removeSavedPizza(savedPizza) {
    try {
      await deleteMySavedPizza(savedPizza.id);
      await loadPizzas();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-6">
        <Link
          to="/account/orders"
          className="text-sm text-blue-500 hover:underline"
        >
          &larr; Mis pedidos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Mis pizzas</h1>
        <p className="text-sm text-stone-500">
          Guarda tus creaciones y vuelve a pedirlas cuando quieras.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {status === 'loading' ? (
        <p className="text-sm text-stone-500">Cargando pizzas...</p>
      ) : pizzas.length === 0 ? (
        <div className="rounded-md border border-stone-200 p-5">
          <p className="text-sm text-stone-600">
            Todavia no tienes pizzas guardadas.
          </p>
          <Link
            to="/builder"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            Crear una pizza
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pizzas.map((pizza) => (
            <article
              key={pizza.id}
              className="rounded-md border border-stone-200 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{pizza.name}</h2>
                  <p className="text-sm text-stone-500">{pizza.baseName}</p>
                  <p className="text-xs text-stone-500">
                    {pizza.recipe.size.diameterCm} cm / {pizza.recipe.size.slices}{' '}
                    tajadas
                  </p>
                </div>
                <p className="shrink-0 font-semibold">
                  {formatCurrency(pizza.estimatedPrice)}
                </p>
              </div>

              <ul className="divide-y divide-stone-100 border-y text-sm">
                {pizza.recipe.items.map((recipeItem) => (
                  <li
                    key={`${recipeItem.ingredientId}-${recipeItem.area}`}
                    className="flex justify-between gap-3 py-2"
                  >
                    <span>
                      <span className="font-semibold">
                        {recipeItem.name} x{recipeItem.portions}
                      </span>
                      <span className="text-stone-500">
                        {' '}
                        - {recipeItem.areaLabel}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatRecipeQuantity(recipeItem)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => addSavedPizzaToCart(pizza)}
                  className="font-semibold text-green-700 hover:underline"
                >
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  onClick={() => removeSavedPizza(pizza)}
                  className="font-semibold text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export async function loader() {
  try {
    const user = await getCurrentCustomer();
    if (!user) return redirect('/login');

    return null;
  } catch {
    return redirect('/login');
  }
}

export default CustomerSavedPizzas;
