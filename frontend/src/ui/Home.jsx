import { useEffect, useState } from 'react';
import { FiArrowRight, FiHeart, FiShoppingCart, FiUsers } from 'react-icons/fi';
import { GiWeightScale } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { getMenu } from '../services/apiRestaurant';
import { formatCurrency } from '../utils/helpers';
import { getCommunityPizzas } from '../services/apiCommunity';
import CommunityPizzaCard from '../features/community/CommunityPizzaCard';

function PizzaPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[680px] py-5 md:py-0">
      <div className="cn-halftone-blue absolute -right-8 -top-10 h-48 w-48 rotate-12 opacity-80" />
      <div className="absolute -left-8 bottom-2 h-24 w-24 rotate-12 bg-[#d7261e] [clip-path:polygon(50%_0,61%_36%,98%_20%,70%_50%,100%_72%,62%_65%,52%_100%,40%_66%,4%_84%,29%_52%,0_32%,39%_36%)]" />
      <img
        src="/images/hero-pizza2.webp"
        alt="Pizza Cosa Nostra con pepperoni, champiñones, aceitunas y albahaca"
        className="relative z-10 -translate-x-[7%] w-[114%] max-w-none rotate-[-5deg] drop-shadow-[12px_14px_0_rgb(17_19_18_/_0.28)] md:-translate-x-[20%] md:w-[145%] lg:-translate-x-[17%] lg:w-[138%]"
      />
      <div className="cn-display absolute -bottom-2 right-0 z-20 rotate-[-5deg] border-[3px] border-stone-950 bg-[#1779a8] px-4 py-3 text-center text-lg uppercase leading-none text-white shadow-[4px_4px_0_#111312] md:right-8 md:text-2xl">
        Hecha a tu manera
      </div>
    </div>
  );
}

const benefits = [
  { icon: GiWeightScale, title: 'Pesos reales', copy: 'Ingredientes medidos como corresponden.' },
  { icon: FiUsers, title: 'Personal o familiar', copy: 'Elige el tamaño perfecto para cada ocasión.' },
  { icon: FiHeart, title: 'Guarda favoritas', copy: 'Tus pizzas favoritas siempre a mano.' },
];

function Home() {
  const [popularPizzas, setPopularPizzas] = useState([]);
  const [communityPizzas, setCommunityPizzas] = useState([]);

  useEffect(function () {
    async function loadPopularPizzas() {
      try {
        const menu = await getMenu();
        setPopularPizzas(menu.filter((pizza) => !pizza.soldOut).slice(0, 3));
      } catch {
        setPopularPizzas([]);
      }
    }
    loadPopularPizzas();

    async function loadCommunityPizzas() {
      try {
        setCommunityPizzas(await getCommunityPizzas({ limit: 3 }));
      } catch {
        setCommunityPizzas([]);
      }
    }
    loadCommunityPizzas();
  }, []);

  return (
    <div className="overflow-hidden bg-stone-950">
      <section className="cn-paper relative min-h-[660px] overflow-hidden border-b-[5px] border-stone-950">
        <div className="absolute -left-24 -top-24 h-64 w-64 rotate-12 bg-stone-950 [clip-path:polygon(0_0,100%_12%,66%_100%,0_76%)]" />
        <div className="absolute -right-24 bottom-[-8rem] hidden h-80 w-[55%] -rotate-6 bg-[#d7261e] md:block" />
        <div className="absolute left-[43%] top-0 hidden h-full w-24 -skew-x-[22deg] border-x-[5px] border-stone-950 bg-[#f9bd16] md:block" />

        <div className="relative mx-auto grid min-h-[660px] w-full max-w-[1480px] items-center gap-8 px-5 pb-20 pt-14 md:grid-cols-[0.88fr_1.12fr] md:px-10 md:py-12 lg:px-16">
          <div className="relative z-20 md:-rotate-1">
            <p className="mb-3 inline-block rotate-[-1deg] bg-[#f9bd16] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-stone-950">
              Pizza personalizada en Cosa Nostra
            </p>
            <h1 className="cn-display max-w-3xl text-[clamp(4.7rem,9vw,9rem)] uppercase italic leading-[0.7] text-stone-950 drop-shadow-[5px_5px_0_#fff8e8]">
              Crea tu
              <span className="block -rotate-2 text-[#d7261e] [-webkit-text-stroke:2px_#111312] md:-translate-x-2">
                pizza
              </span>
            </h1>
            <p className="mt-7 max-w-lg text-base font-semibold leading-7 text-stone-800 sm:text-lg">
              Elige tamaño, agrega insumos y mira tu pizza antes de pedirla. La hacemos exactamente como la imaginaste.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link to="/builder" className="cn-shadow inline-flex items-center gap-3 border-[3px] border-stone-950 bg-[#f9bd16] px-6 py-3 text-sm font-black uppercase transition hover:-translate-y-1">
                Crear mi pizza <FiArrowRight className="text-xl" />
              </Link>
              <Link to="/menu" className="inline-flex items-center border-[3px] border-stone-950 bg-[#fff8e8] px-6 py-3 text-sm font-black uppercase transition hover:bg-white">
                Ver carta
              </Link>
            </div>
          </div>
          <div className="relative z-10 md:-ml-10">
            <PizzaPreview />
          </div>
        </div>

        <div className="absolute -bottom-1 left-0 h-12 w-full bg-[#f9bd16] [clip-path:polygon(0_72%,7%_42%,13%_72%,22%_22%,32%_70%,41%_34%,49%_76%,61%_24%,72%_70%,84%_36%,93%_68%,100%_30%,100%_100%,0_100%)]" />
      </section>

      <section className="relative border-b-[5px] border-stone-950 bg-[#f9bd16] px-5 pb-16 pt-10 md:px-10">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-9 flex items-center justify-center">
            <h2 className="cn-display rotate-[-2deg] border-[4px] border-stone-950 bg-stone-950 px-6 py-2 text-4xl uppercase italic text-white shadow-[6px_6px_0_#d7261e] sm:text-5xl">
              Beneficios
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {benefits.map(({ icon: Icon, title, copy }, index) => (
              <article key={title} className={`relative flex flex-col items-center px-5 py-3 text-center ${index === 1 ? 'sm:translate-y-4' : ''}`}>
                <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[4px] border-stone-950 bg-[#fff8e8] text-4xl shadow-[5px_5px_0_#111312]">
                  <Icon />
                </span>
                <h3 className="cn-display mt-5 text-2xl uppercase">{title}</h3>
                <p className="mx-auto mt-1 max-w-56 text-sm font-semibold leading-5 text-stone-800">{copy}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-10 left-0 z-10 h-14 w-full bg-[#d7261e] [clip-path:polygon(0_24%,8%_62%,16%_18%,27%_68%,39%_20%,50%_76%,62%_24%,74%_70%,86%_18%,100%_60%,100%_100%,0_100%)]" />
      </section>

      <section className="relative bg-[#d7261e] px-5 pb-20 pt-20 md:px-10 lg:px-14">
        <div className="cn-halftone-blue absolute bottom-0 right-0 h-56 w-56 opacity-60" />
        <div className="relative mx-auto max-w-[1320px]">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f9bd16]">Directo del horno</p>
              <h2 className="cn-display mt-1 rotate-[-2deg] bg-[#fff8e8] px-5 py-2 text-4xl uppercase italic text-stone-950 shadow-[7px_7px_0_#111312] sm:text-6xl">
                Carta rápida
              </h2>
            </div>
            <Link to="/menu" className="inline-flex items-center gap-2 border-2 border-stone-950 bg-[#f9bd16] px-4 py-2 text-sm font-black uppercase shadow-[3px_3px_0_#111312] hover:bg-yellow-300">
              Ver menú completo <FiArrowRight />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {popularPizzas.map((pizza, index) => (
              <article key={pizza.id} className={`cn-shadow relative overflow-hidden border-[4px] border-stone-950 bg-[#fff8e8] ${index === 1 ? 'md:-translate-y-3 md:rotate-1' : index === 2 ? 'md:-rotate-1' : 'md:rotate-[-0.5deg]'}`}>
                {index === 0 && <span className="absolute left-0 top-3 z-10 bg-[#d7261e] px-3 py-1 text-xs font-black uppercase text-white">Más pedida</span>}
                {pizza.imageUrl ? (
                  <img src={pizza.imageUrl} alt={pizza.name} className="h-52 w-full border-b-[4px] border-stone-950 object-cover" />
                ) : (
                  <div className="flex h-52 items-center justify-center border-b-[4px] border-stone-950 bg-[#f2e5ce] text-sm font-bold uppercase">Sin foto</div>
                )}
                <div className="p-4">
                  <h3 className="cn-display text-2xl uppercase leading-none">{pizza.name}</h3>
                  <p className="mt-2 min-h-10 text-xs capitalize leading-5 text-stone-600">{pizza.ingredients.join(', ')}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-lg font-black text-[#d7261e]">{formatCurrency(pizza.unitPrice)}</p>
                    <Link to="/menu" className="inline-flex items-center gap-2 border-2 border-stone-950 bg-[#d7261e] px-3 py-2 text-xs font-black uppercase text-white shadow-[2px_2px_0_#111312]">
                      Ver en carta <FiShoppingCart />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {communityPizzas.length > 0 && (
        <section className="relative border-t-[5px] border-stone-950 bg-[#1779a8] px-5 py-16 md:px-10 lg:px-14">
          <div className="absolute -left-12 -top-12 h-40 w-40 rotate-12 bg-[#f9bd16] [clip-path:polygon(50%_0,61%_36%,98%_20%,70%_50%,100%_72%,62%_65%,52%_100%,40%_66%,4%_84%,29%_52%,0_32%,39%_36%)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-[1320px]">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f9bd16]">Creaciones de la comunidad</p>
                <h2 className="cn-display mt-2 rotate-[-1deg] text-5xl uppercase italic text-white drop-shadow-[5px_5px_0_#111312] sm:text-7xl">Pizzas del barrio</h2>
              </div>
              <Link to="/comunidad" className="inline-flex items-center gap-2 border-[3px] border-stone-950 bg-[#f9bd16] px-5 py-3 text-xs font-black uppercase text-stone-950 shadow-[4px_4px_0_#111312]">
                Ver todas <FiArrowRight />
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {communityPizzas.map((pizza, index) => <CommunityPizzaCard key={pizza.id} pizza={pizza} featured={index === 1} />)}
            </div>
          </div>
        </section>
      )}

      <section className="grid border-t-[5px] border-stone-950 md:grid-cols-2">
        <div className="relative overflow-hidden bg-[#1779a8] p-8 text-stone-100 md:p-12 lg:p-16">
          <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full border-[18px] border-[#f9bd16] opacity-40" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f9bd16]">Muy pronto</p>
          <h2 className="cn-display mt-2 text-5xl uppercase italic drop-shadow-[4px_4px_0_#111312]">Combos y promos</h2>
          <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-white">Estamos preparando ofertas para compartir. Mientras tanto, la carta y el constructor ya están listos para recibir tu pedido.</p>
        </div>
        <div className="relative bg-stone-950 p-8 text-white md:p-12 lg:p-16">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7261e]">Fácil y rápido</p>
          <h2 className="cn-display mt-2 text-5xl uppercase italic text-[#f9bd16]">Arma. Pide. Disfruta.</h2>
          <ol className="mt-5 grid grid-cols-2 gap-4 text-sm font-bold">
            {['Arma tu pizza', 'Agrega al carrito', 'Elige cómo pagar', 'Sigue tu pedido'].map((step, index) => (
              <li key={step} className="flex items-center gap-2"><span className="cn-display text-2xl text-[#d7261e]">{index + 1}.</span>{step}</li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

export default Home;
