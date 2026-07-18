import { useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import Button from '../../ui/Button';
import { getBuilderPizzaSizes, getMenu } from '../../services/apiRestaurant';
import MenuItem from './MenuItem';

function Menu() {
  const menu = useLoaderData();
  const [sizes, setSizes] = useState([]);
  const [selectedSizeId, setSelectedSizeId] = useState('');

  useEffect(function () {
    async function loadSizes() {
      const nextSizes = await getBuilderPizzaSizes();
      setSizes(nextSizes);
      setSelectedSizeId(String(nextSizes[0]?.id || ''));
    }

    loadSizes();
  }, []);

  const selectedSize = useMemo(
    () => sizes.find((size) => String(size.id) === selectedSizeId),
    [selectedSizeId, sizes],
  );

  return (
    <div className="px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Carta</h1>
          <p className="mt-2 text-sm text-stone-500">
            Pide rapido una pizza de la casa o crea una desde cero.
          </p>
        </div>
        <Button to="/builder" type="small">
          Crea tu pizza
        </Button>
      </div>

      {sizes.length > 0 && (
        <div className="mb-5 rounded-md border border-stone-200 p-3">
          <p className="mb-2 text-sm font-semibold">Tamano</p>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            {sizes.map((size) => (
              <button
                type="button"
                key={size.id}
                onClick={() => setSelectedSizeId(String(size.id))}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                  selectedSizeId === String(size.id)
                    ? 'border-stone-950 bg-stone-950 text-yellow-300'
                    : 'border-stone-200 bg-white text-stone-700'
                }`}
              >
                {size.name} / {size.diameterCm} cm
              </button>
            ))}
          </div>
        </div>
      )}

      <ul className="divide-y divide-stone-200">
        {menu.map((pizza) => (
          <MenuItem pizza={pizza} selectedSize={selectedSize} key={pizza.id} />
        ))}
      </ul>
    </div>
  );
}

export async function loader() {
  const menu = await getMenu();
  return menu;
}

export default Menu;
