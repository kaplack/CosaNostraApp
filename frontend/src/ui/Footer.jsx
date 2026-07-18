import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-12 border-t border-stone-200 bg-stone-950 px-4 py-8 text-stone-200 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 text-sm md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Link
            to="/"
            className="inline-flex"
            aria-label="Cosa Nostra"
          >
            <img
              src="/Logotipo-negativo.png"
              alt="Cosa Nostra"
              className="h-7 w-auto"
            />
          </Link>
          <p className="mt-3 max-w-sm text-stone-400">
            Pizzas familiares, personales y personalizadas para armar a tu manera.
          </p>
        </div>

        <div>
          <p className="mb-3 font-semibold uppercase text-stone-100">Pide</p>
          <div className="grid gap-2 text-stone-400">
            <Link to="/builder" className="hover:text-yellow-300">
              Crea tu pizza
            </Link>
            <Link to="/menu" className="hover:text-yellow-300">
              Carta
            </Link>
            <Link to="/order/track" className="hover:text-yellow-300">
              Seguir pedido
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-3 font-semibold uppercase text-stone-100">Local</p>
          <div className="space-y-2 text-stone-400">
            <p>Delivery y recojo previa coordinacion.</p>
            <p>Pagos con efectivo, Yape o Plin.</p>
            <p>WhatsApp disponible en cada pedido.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
