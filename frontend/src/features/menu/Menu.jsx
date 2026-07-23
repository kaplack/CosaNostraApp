import { useEffect, useMemo, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { Link, useLoaderData } from 'react-router-dom';
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
    <div className="overflow-hidden bg-[#d7261e]">
      <section className="cn-paper relative overflow-hidden border-b-[5px] border-stone-950 px-5 py-12 md:px-10 lg:px-16">
        <div className="absolute -left-12 -top-20 h-56 w-56 rotate-12 bg-stone-950 [clip-path:polygon(0_0,100%_20%,58%_100%,0_70%)]" />
        <div className="cn-halftone-blue absolute -right-6 -top-6 h-52 w-52 rotate-12 opacity-70" />
        <div className="relative mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="relative z-10">
            <p className="mb-2 inline-block rotate-[-1deg] bg-[#f9bd16] px-3 py-1 text-xs font-black uppercase tracking-[0.2em]">Directo del horno</p>
            <h1 className="cn-display text-6xl uppercase italic leading-none text-stone-950 drop-shadow-[4px_4px_0_#d7261e] sm:text-8xl">Nuestra carta</h1>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-stone-700 sm:text-base">Elige una pizza de la casa, selecciona el tamaño y nosotros nos encargamos del resto.</p>
          </div>
          <Link to="/builder" className="cn-shadow relative z-10 inline-flex items-center gap-3 border-[3px] border-stone-950 bg-[#f9bd16] px-6 py-3 text-sm font-black uppercase transition hover:-translate-y-1">
            Crear mi pizza <FiArrowRight className="text-xl" />
          </Link>
        </div>
      </section>

      {sizes.length > 0 && (
        <section className="border-b-[5px] border-stone-950 bg-[#f9bd16] px-5 py-5 md:px-10 lg:px-16">
          <div className="mx-auto flex max-w-[1320px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="cn-display text-2xl uppercase">Elige el tamaño</p>
              <p className="text-xs font-semibold text-stone-700">Los precios se actualizan automáticamente.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              {sizes.map((size) => (
                <button
                  type="button"
                  key={size.id}
                  onClick={() => setSelectedSizeId(String(size.id))}
                  className={`border-[3px] border-stone-950 px-4 py-2 text-xs font-black uppercase tracking-wide transition hover:-translate-y-0.5 ${
                    selectedSizeId === String(size.id)
                      ? 'bg-stone-950 text-yellow-300 shadow-[3px_3px_0_#d7261e]'
                      : 'bg-[#fff8e8] text-stone-950 shadow-[3px_3px_0_#111312]'
                  }`}
                >
                  {size.name} · {size.diameterCm} cm
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative px-5 py-14 md:px-10 lg:px-16">
        <div className="absolute left-0 top-0 h-16 w-full bg-stone-950 [clip-path:polygon(0_0,8%_42%,17%_5%,28%_45%,39%_8%,50%_48%,62%_6%,74%_43%,87%_4%,100%_40%,100%_0)]" />
        <ul className="relative mx-auto grid max-w-[1320px] gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {menu.map((pizza, index) => (
            <MenuItem pizza={pizza} selectedSize={selectedSize} index={index} key={pizza.id} />
          ))}
        </ul>
      </section>
    </div>
  );
}

export async function loader() {
  const menu = await getMenu();
  return menu;
}

export default Menu;
