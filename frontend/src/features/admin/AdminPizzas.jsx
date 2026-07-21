import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, redirect } from 'react-router-dom';
import {
  createAdminPizza,
  deactivateAdminPizza,
  getAdminPizzas,
  updateAdminPizza,
  uploadAdminPizzaImage,
} from '../../services/apiAdminPizzas';
import { clearSession, getCurrentAdmin } from '../../services/apiAuth';
import Button from '../../ui/Button';

const emptyForm = {
  name: '',
  unitPrice: '',
  ingredients: '',
  imageUrl: '',
  soldOut: false,
  isActive: true,
};

function pizzaToForm(pizza) {
  return {
    name: pizza.name,
    unitPrice: String(pizza.unitPrice),
    ingredients: pizza.ingredients.join(', '),
    imageUrl: pizza.imageUrl,
    soldOut: pizza.soldOut,
    isActive: pizza.isActive,
  };
}

function AdminPizzas() {
  const [pizzas, setPizzas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingPizza, setEditingPizza] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const imageInputRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const activeCount = useMemo(
    () => pizzas.filter((pizza) => pizza.isActive).length,
    [pizzas],
  );

  useEffect(function () {
    loadPizzas();
  }, []);

  async function loadPizzas() {
    try {
      setStatus('loading');
      setError('');
      setPizzas(await getAdminPizzas());
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function startEdit(pizza) {
    setEditingPizza(pizza);
    setForm(pizzaToForm(pizza));
    setImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingPizza(null);
    setForm(emptyForm);
    setImageFile(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...form,
      unitPrice: Number(form.unitPrice),
      ingredients: form.ingredients,
    };

    try {
      setStatus('saving');
      setError('');

      let savedPizza;

      if (editingPizza) {
        savedPizza = await updateAdminPizza(editingPizza.id, payload);
      } else {
        savedPizza = await createAdminPizza(payload);
      }

      if (imageFile) {
        await uploadAdminPizzaImage(savedPizza.id, imageFile);
      }

      resetForm();
      await loadPizzas();
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  async function toggleSoldOut(pizza) {
    try {
      await updateAdminPizza(pizza.id, { soldOut: !pizza.soldOut });
      await loadPizzas();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(pizza) {
    try {
      await updateAdminPizza(pizza.id, { isActive: !pizza.isActive });
      await loadPizzas();
    } catch (err) {
      setError(err.message);
    }
  }

  async function hidePizza(pizza) {
    try {
      await deactivateAdminPizza(pizza.id);
      await loadPizzas();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="text-sm text-blue-500 hover:underline">
            &larr; Panel admin
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Pizzas</h1>
          <p className="text-sm text-stone-500">
            {pizzas.length} pizzas registradas, {activeCount} visibles en carta.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid gap-4 rounded-md border border-stone-200 p-4"
      >
        <div>
          <h2 className="text-lg font-semibold">
            {editingPizza ? `Editar ${editingPizza.name}` : 'Nueva pizza'}
          </h2>
          <p className="text-sm text-stone-500">
            Sube una imagen al bucket privado de S3 o deja una URL externa.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Nombre</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Precio</span>
            <input
              name="unitPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-sm font-medium">Ingredientes</span>
          <input
            name="ingredients"
            value={form.ingredients}
            onChange={handleChange}
            placeholder="tomato, mozzarella, basil"
            className="input w-full"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Imagen</span>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-800 hover:file:bg-yellow-300"
          />
          {imageFile && (
            <p className="text-xs text-stone-500">
              Archivo seleccionado: {imageFile.name}
            </p>
          )}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">URL externa de imagen</span>
          <input
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="input w-full"
          />
        </label>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="soldOut"
              checked={form.soldOut}
              onChange={handleChange}
              className="h-5 w-5 accent-yellow-400"
            />
            Agotada
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-5 w-5 accent-yellow-400"
            />
            Visible en carta
          </label>
        </div>

        {error && (
          <p className="rounded-md bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button disabled={status === 'saving'} type="small">
            {status === 'saving'
              ? 'Guardando...'
              : editingPizza
                ? 'Guardar cambios'
                : 'Crear pizza'}
          </Button>
          {editingPizza && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-semibold text-stone-500 hover:text-stone-800"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {status === 'loading' ? (
        <p className="text-sm text-stone-500">Cargando pizzas...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3 pr-4">Pizza</th>
                <th className="py-3 pr-4">Precio</th>
                <th className="py-3 pr-4">Estado</th>
                <th className="py-3 pr-4">Ingredientes</th>
                <th className="py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pizzas.map((pizza) => (
                <tr key={pizza.id} className="border-b align-top">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {pizza.imageUrl ? (
                        <img
                          src={pizza.imageUrl}
                          alt={pizza.name}
                          className="h-14 w-14 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded bg-stone-200 text-xs text-stone-500">
                          Sin foto
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{pizza.name}</p>
                        <p className="text-xs text-stone-500">#{pizza.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">S/ {pizza.unitPrice.toFixed(2)}</td>
                  <td className="space-y-1 py-3 pr-4">
                    <span
                      className={`block font-semibold ${
                        pizza.isActive ? 'text-green-700' : 'text-stone-400'
                      }`}
                    >
                      {pizza.isActive ? 'Visible' : 'Oculta'}
                    </span>
                    <span
                      className={`block ${
                        pizza.soldOut ? 'text-red-600' : 'text-stone-500'
                      }`}
                    >
                      {pizza.soldOut ? 'Agotada' : 'Disponible'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-stone-600">
                    {pizza.ingredients.join(', ')}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(pizza)}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSoldOut(pizza)}
                        className="font-semibold text-stone-600 hover:underline"
                      >
                        {pizza.soldOut ? 'Disponible' : 'Agotada'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(pizza)}
                        className="font-semibold text-stone-600 hover:underline"
                      >
                        {pizza.isActive ? 'Ocultar' : 'Activar'}
                      </button>
                      {pizza.isActive && (
                        <button
                          type="button"
                          onClick={() => hidePizza(pizza)}
                          className="font-semibold text-red-600 hover:underline"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export async function loader() {
  try {
    const user = await getCurrentAdmin();
    if (!user) return redirect('/admin/login');

    return null;
  } catch {
    clearSession();
    return redirect('/admin/login');
  }
}

export default AdminPizzas;
