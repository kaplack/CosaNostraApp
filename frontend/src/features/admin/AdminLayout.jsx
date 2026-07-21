import { useState } from 'react';
import {
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useNavigation,
} from 'react-router-dom';
import { clearSession, getCurrentAdmin } from '../../services/apiAuth';
import Loader from '../../ui/Loader';

const navigationItems = [
  { to: '/admin', label: 'Panel', end: true },
  { to: '/admin/orders', label: 'Pedidos' },
  { to: '/admin/pizzas', label: 'Pizzas' },
  { to: '/admin/ingredients', label: 'Insumos' },
  { to: '/admin/sizes', label: 'Tamanos' },
  { to: '/admin/payments', label: 'Pagos' },
];

function AdminSidebar({ onNavigate }) {
  const user = useLoaderData();

  function handleLogout() {
    clearSession();
    window.location.assign('/admin/login');
  }

  return (
    <div className="flex h-full flex-col bg-stone-950 text-stone-100">
      <div className="border-b border-stone-800 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-400">
          Cosa Nostra
        </p>
        <p className="mt-1 text-lg font-semibold">Administracion</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Navegacion admin">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-md px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-yellow-400 text-stone-950'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-stone-800 p-4">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="mb-3 truncate text-xs text-stone-400">{user.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-full border border-stone-700 px-4 py-2 text-xs font-semibold uppercase text-stone-200 hover:border-stone-500 hover:bg-stone-800"
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div className="min-h-screen bg-stone-50 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      {isLoading && <Loader />}

      <aside className="sticky top-0 hidden h-screen lg:block">
        <AdminSidebar />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Cosa Nostra
            </p>
            <p className="font-semibold">Administracion</p>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-expanded={isSidebarOpen}
            aria-controls="admin-mobile-sidebar"
            className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Menu
          </button>
        </header>

        <main className="mx-auto w-full max-w-7xl">
          <Outlet />
        </main>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menu admin"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside
            id="admin-mobile-sidebar"
            className="relative h-full w-[min(82vw,300px)] shadow-2xl"
          >
            <AdminSidebar onNavigate={() => setIsSidebarOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}

export async function loader() {
  try {
    const user = await getCurrentAdmin();
    if (!user) return redirect('/admin/login');

    return user;
  } catch {
    clearSession();
    return redirect('/admin/login');
  }
}

export default AdminLayout;
