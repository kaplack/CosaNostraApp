import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMenu } from '../services/apiRestaurant';
import Button from './Button';
import { formatCurrency } from '../utils/helpers';

function PizzaPreview() {
  const pepperoni = [
    ['22%', '34%'],
    ['38%', '24%'],
    ['59%', '30%'],
    ['70%', '48%'],
    ['47%', '56%'],
    ['29%', '65%'],
    ['61%', '70%'],
  ];
  const mushrooms = [
    ['31%', '45%'],
    ['51%', '39%'],
    ['67%', '61%'],
    ['39%', '73%'],
  ];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[360px] rounded-full bg-[#d9943a] p-[7%] shadow-xl shadow-stone-900/20">
      <div className="relative h-full w-full overflow-hidden rounded-full bg-red-600">
        <div className="absolute inset-[6%] rounded-full bg-yellow-100/90" />
        {Array.from({ length: 58 }, (_, index) => (
          <span
            key={index}
            className="absolute h-[1.4%] w-[17%] rounded-full bg-yellow-50"
            style={{
              left: `${15 + ((index * 17) % 68)}%`,
              top: `${16 + ((index * 23) % 68)}%`,
              transform: `rotate(${(index * 37) % 180}deg)`,
            }}
          />
        ))}
        {pepperoni.map(([left, top], index) => (
          <span
            key={`pepperoni-${index}`}
            className="absolute h-[13%] w-[13%] rounded-full bg-red-500 shadow-inner shadow-red-900/50"
            style={{ left, top }}
          />
        ))}
        {mushrooms.map(([left, top], index) => (
          <span
            key={`mushroom-${index}`}
            className="absolute h-[10%] w-[10%] rounded-full bg-stone-100 shadow-inner shadow-stone-400"
            style={{ left, top }}
          />
        ))}
      </div>
    </div>
  );
}

function Home() {
  const [popularPizzas, setPopularPizzas] = useState([]);

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
  }, []);

  return (
    <div className="px-4 py-8 sm:px-6">
      <section className="grid min-h-[calc(100vh-180px)] items-center gap-10 py-8 md:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-yellow-600">
            Pizza personalizada en Cosa Nostra
          </p>
          <h1 className="max-w-3xl text-5xl font-black uppercase leading-none tracking-normal text-stone-950 md:text-7xl">
            Crea tu pizza
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">
            Elige tamano, agrega insumos, mira tu pizza antes de pedirla y
            nosotros la preparamos tal como la armaste.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/builder" type="primary">
              Crear mi pizza
            </Button>
            <Button to="/menu" type="secondary">
              Ver carta
            </Button>
          </div>
          <div className="mt-8 grid max-w-xl gap-3 text-sm text-stone-600 sm:grid-cols-3">
            <p>
              <strong className="block text-stone-950">Pesos reales</strong>
              Ves gramos y precio mientras eliges.
            </p>
            <p>
              <strong className="block text-stone-950">Personal o familiar</strong>
              La escala cambia segun el tamano.
            </p>
            <p>
              <strong className="block text-stone-950">Guarda favoritas</strong>
              Repite tus creaciones desde tu cuenta.
            </p>
          </div>
        </div>

        <PizzaPreview />
      </section>

      <section className="py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Carta rapida</h2>
            <p className="text-sm text-stone-500">
              Para quienes quieren pedir lo de siempre.
            </p>
          </div>
          <Link to="/menu" className="text-sm font-semibold text-blue-600 hover:underline">
            Ver menu completo
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {popularPizzas.map((pizza) => (
            <article
              key={pizza.id}
              className="overflow-hidden rounded-md border border-stone-200 bg-white"
            >
              {pizza.imageUrl ? (
                <img
                  src={pizza.imageUrl}
                  alt={pizza.name}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-stone-100 text-sm text-stone-500">
                  Sin foto
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between gap-3">
                  <h3 className="font-semibold">{pizza.name}</h3>
                  <p className="font-semibold">{formatCurrency(pizza.unitPrice)}</p>
                </div>
                <p className="mt-2 text-sm capitalize italic text-stone-500">
                  {pizza.ingredients.join(', ')}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 py-10 md:grid-cols-2">
        <div className="rounded-md bg-stone-950 p-6 text-stone-100">
          <p className="text-sm font-semibold uppercase text-yellow-300">Oferta</p>
          <h2 className="mt-3 text-2xl font-semibold">Combos y promos</h2>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            Pronto tendras ofertas administrables desde el panel. Por ahora, la
            carta y el constructor ya estan listos para recibir pedidos.
          </p>
        </div>
        <div className="rounded-md border border-stone-200 p-6">
          <p className="text-sm font-semibold uppercase text-yellow-600">
            Como funciona
          </p>
          <ol className="mt-4 grid gap-3 text-sm text-stone-600">
            <li>
              <strong className="text-stone-950">1. Arma</strong> tu pizza con
              insumos y pesos visibles.
            </li>
            <li>
              <strong className="text-stone-950">2. Agrega</strong> al carrito o
              guarda tu creacion.
            </li>
            <li>
              <strong className="text-stone-950">3. Paga</strong> con efectivo,
              Yape o Plin.
            </li>
            <li>
              <strong className="text-stone-950">4. Sigue</strong> tu pedido con
              el codigo.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}

export default Home;
