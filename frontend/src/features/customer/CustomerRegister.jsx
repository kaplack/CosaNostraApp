import { Form, Link, redirect, useActionData, useNavigation } from 'react-router-dom';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { registerCustomer } from '../../services/apiCustomerAuth';

function CustomerRegister() {
  const error = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <section className="cn-paper min-h-[680px] border-x-[3px] border-stone-950 px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden border-[4px] border-stone-950 shadow-[8px_8px_0_#111312] lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="relative overflow-hidden border-b-[4px] border-stone-950 bg-[#f9bd16] p-6 lg:border-b-0 lg:border-r-[4px] lg:p-9">
          <div className="absolute -right-12 -top-12 h-32 w-32 rotate-12 bg-[#1779a8]" aria-hidden="true" />
          <p className="relative text-xs font-black uppercase tracking-[0.2em]">Hazla siempre a tu manera</p>
          <h1 className="cn-display relative mt-3 text-5xl uppercase italic leading-[0.85] sm:text-6xl">Únete a la familia</h1>
          <ul className="relative mt-7 space-y-3 text-sm font-bold">
            {['Guarda tus pizzas', 'Repite pedidos en segundos', 'Administra tus direcciones'].map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center border-2 border-stone-950 bg-[#fff8e8]"><FiCheck /></span>
                {benefit}
              </li>
            ))}
          </ul>
        </aside>

        <div className="bg-[#fff8e8] p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7261e]">Tu próxima pizza empieza aquí</p>
          <h2 className="cn-display mt-2 text-4xl uppercase italic leading-none sm:text-5xl">Crear cuenta</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-stone-600">Guarda tus pedidos sin perder la opción de comprar como invitado.</p>

          <Form method="POST" className="mt-7 grid gap-5 sm:grid-cols-2">
            <label htmlFor="register-name" className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em]">Nombre</span>
              <input id="register-name" name="name" autoComplete="name" required className="mt-2 w-full border-[3px] border-stone-950 bg-white px-4 py-3 text-sm font-semibold shadow-[3px_3px_0_#111312] focus:outline-none focus:ring-2 focus:ring-[#f9bd16]" />
            </label>

            <label htmlFor="register-phone" className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em]">WhatsApp</span>
              <input id="register-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required className="mt-2 w-full border-[3px] border-stone-950 bg-white px-4 py-3 text-sm font-semibold shadow-[3px_3px_0_#111312] focus:outline-none focus:ring-2 focus:ring-[#f9bd16]" />
            </label>

            <label htmlFor="register-email" className="block sm:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.12em]">Email</span>
              <input id="register-email" name="email" type="email" autoComplete="email" required className="mt-2 w-full border-[3px] border-stone-950 bg-white px-4 py-3 text-sm font-semibold shadow-[3px_3px_0_#111312] focus:outline-none focus:ring-2 focus:ring-[#f9bd16]" />
            </label>

            <label htmlFor="register-password" className="block sm:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.12em]">Contraseña</span>
              <input id="register-password" name="password" type="password" minLength="6" autoComplete="new-password" required className="mt-2 w-full border-[3px] border-stone-950 bg-white px-4 py-3 text-sm font-semibold shadow-[3px_3px_0_#111312] focus:outline-none focus:ring-2 focus:ring-[#f9bd16]" />
              <span className="mt-2 block text-xs font-semibold text-stone-500">Mínimo 6 caracteres.</span>
            </label>

            {error && <p role="alert" className="border-[3px] border-red-800 bg-red-100 p-3 text-xs font-bold text-red-800 sm:col-span-2">{error}</p>}

            <button disabled={isSubmitting} type="submit" className="cn-shadow inline-flex w-full items-center justify-center gap-2 border-[3px] border-stone-950 bg-[#f9bd16] px-5 py-3 text-sm font-black uppercase transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">
              {isSubmitting ? 'Creando...' : 'Crear cuenta'} {!isSubmitting && <FiArrowRight />}
            </button>
          </Form>

          <p className="mt-6 border-t-2 border-stone-300 pt-5 text-sm font-semibold text-stone-600">
            ¿Ya tienes cuenta? <Link to="/login" className="font-black uppercase text-[#d7261e] underline decoration-2 underline-offset-4">Ingresar</Link>
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
    await registerCustomer(payload);
    return redirect('/account/orders');
  } catch (err) {
    return err.message;
  }
}

export default CustomerRegister;
