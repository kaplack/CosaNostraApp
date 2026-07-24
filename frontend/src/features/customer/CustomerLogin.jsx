import { Form, Link, redirect, useActionData, useNavigation } from 'react-router-dom';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { loginCustomer } from '../../services/apiCustomerAuth';

function CustomerLogin() {
  const error = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <section className="cn-paper min-h-[620px] border-x-[3px] border-stone-950 px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="mx-auto grid max-w-4xl overflow-hidden border-[4px] border-stone-950 shadow-[8px_8px_0_#111312] lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative overflow-hidden border-b-[4px] border-stone-950 bg-[#f9bd16] p-6 lg:border-b-0 lg:border-r-[4px] lg:p-9">
          <div className="absolute -right-12 -top-12 h-32 w-32 rotate-12 bg-[#d7261e]" aria-hidden="true" />
          <p className="relative text-xs font-black uppercase tracking-[0.2em]">Tu cuenta Cosa Nostra</p>
          <h1 className="cn-display relative mt-3 text-5xl uppercase italic leading-[0.85] sm:text-6xl">Vuelve por otra</h1>
          <ul className="relative mt-7 space-y-3 text-sm font-bold">
            {['Revisa tus pedidos', 'Repite tus pizzas', 'Usa tus direcciones'].map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center border-2 border-stone-950 bg-[#fff8e8]"><FiCheck /></span>
                {benefit}
              </li>
            ))}
          </ul>
        </aside>

        <div className="bg-[#fff8e8] p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7261e]">Bienvenido de vuelta</p>
          <h2 className="cn-display mt-2 text-4xl uppercase italic leading-none sm:text-5xl">Ingresar</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-stone-600">Tu cuenta es opcional. Siempre puedes seguir pidiendo como invitado.</p>

          <Form method="POST" className="mt-7 space-y-5">
            <label htmlFor="login-email" className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em]">Email</span>
              <input id="login-email" name="email" type="email" autoComplete="email" required className="mt-2 w-full border-[3px] border-stone-950 bg-white px-4 py-3 text-sm font-semibold shadow-[3px_3px_0_#111312] focus:outline-none focus:ring-2 focus:ring-[#f9bd16]" />
            </label>

            <label htmlFor="login-password" className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em]">Contraseña</span>
              <input id="login-password" name="password" type="password" autoComplete="current-password" required className="mt-2 w-full border-[3px] border-stone-950 bg-white px-4 py-3 text-sm font-semibold shadow-[3px_3px_0_#111312] focus:outline-none focus:ring-2 focus:ring-[#f9bd16]" />
            </label>

            {error && <p role="alert" className="border-[3px] border-red-800 bg-red-100 p-3 text-xs font-bold text-red-800">{error}</p>}

            <button disabled={isSubmitting} type="submit" className="cn-shadow inline-flex w-full items-center justify-center gap-2 border-[3px] border-stone-950 bg-[#f9bd16] px-5 py-3 text-sm font-black uppercase transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Ingresando...' : 'Ingresar'} {!isSubmitting && <FiArrowRight />}
            </button>
          </Form>

          <p className="mt-6 border-t-2 border-stone-300 pt-5 text-sm font-semibold text-stone-600">
            ¿Aún no tienes cuenta? <Link to="/register" className="font-black uppercase text-[#d7261e] underline decoration-2 underline-offset-4">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const payload = Object.fromEntries(formData);

  try {
    await loginCustomer(payload);
    return redirect('/account/orders');
  } catch (err) {
    return err.message;
  }
}

export default CustomerLogin;
