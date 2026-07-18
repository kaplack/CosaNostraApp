import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  getBuilderIngredients,
  getBuilderPizzaSizes,
} from '../../services/apiRestaurant';
import { getStoredCustomer } from '../../services/apiCustomerAuth';
import { createMySavedPizza } from '../../services/apiCustomerPizzas';
import Button from '../../ui/Button';
import { formatCurrency } from '../../utils/helpers';
import { addItem } from '../cart/cartSlice';

const areas = [
  ['whole', 'Toda'],
  ['left', 'Izquierda'],
  ['right', 'Derecha'],
];
const ingredientCategories = [
  ['all', 'Todo'],
  ['base', 'Base'],
  ['sauce', 'Salsas'],
  ['cheese', 'Quesos'],
  ['protein', 'Proteinas'],
  ['vegetable', 'Vegetales'],
  ['extra', 'Extras'],
];
const TOPPING_MIN_RADIUS = 4;
const TOPPING_MAX_RADIUS = 34;
const TOPPING_LAYER_INSET = 11;
const DEFAULT_SPRITE_SIZE_CM = 4.5;

function hashSeed(value) {
  const text = String(value);
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRandom(seed) {
  let value = seed >>> 0;

  return function nextRandom() {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function areaClipPath(area) {
  if (area === 'left') return 'inset(0 50% 0 0)';
  if (area === 'right') return 'inset(0 0 0 50%)';
  return 'none';
}

function isPointInArea(x, area) {
  if (area === 'left') return x <= 50;
  if (area === 'right') return x >= 50;
  return true;
}

function spritePoint(seed, area) {
  const random = seededRandom(seed);
  let x = 50;
  let y = 50;

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * (TOPPING_MAX_RADIUS - TOPPING_MIN_RADIUS) +
      TOPPING_MIN_RADIUS;
    x = 50 + Math.cos(angle) * radius;
    y = 50 + Math.sin(angle) * radius;

    if (isPointInArea(x, area)) break;
  }

  return {
    left: x,
    top: y,
    rotation: random() * 360,
    scale: 0.72 + random() * 0.36,
  };
}

function selectionKey(ingredientId, area) {
  return `${ingredientId}:${area}`;
}

function formatArea(area) {
  if (area === 'left') return 'Mitad izquierda';
  if (area === 'right') return 'Mitad derecha';
  return 'Toda';
}

function formatQuantity(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function ingredientTotalQuantity(item, selectedSize) {
  const sizeMultiplier = selectedSize?.portionMultiplier || 1;
  return item.ingredient.portionQuantity * item.portions * sizeMultiplier;
}

function createBatchSeed(ingredientId, area) {
  return hashSeed(`${ingredientId}:${area}:${Date.now()}:${Math.random()}`);
}

function spriteSizePercent(ingredient, selectedSize) {
  const diameterCm = selectedSize?.diameterCm || 34;
  const visualSizeCm = ingredient.visualSizeCm || DEFAULT_SPRITE_SIZE_CM;

  return (visualSizeCm / diameterCm) * 100;
}

function minSeparationPercent(ingredient, sizePercent) {
  const factors = {
    protein: 0.82,
    vegetable: 0.58,
    cheese: 0,
    extra: 0.5,
  };

  return sizePercent * (factors[ingredient.category] ?? 0.45);
}

function distanceBetween(pointA, pointB) {
  return Math.hypot(pointA.left - pointB.left, pointA.top - pointB.top);
}

function buildScatterSprites(scatterItems, selectedSize) {
  const placedSprites = [];

  return scatterItems.flatMap((item) => {
    const sizePercent = spriteSizePercent(item.ingredient, selectedSize);
    const minSeparation = minSeparationPercent(item.ingredient, sizePercent);
    const shouldAvoidOverlap = minSeparation > 0;
    const batches = item.batches?.length
      ? item.batches
      : [
          {
            seed: hashSeed(`${item.ingredientId}:${item.area}`),
            portions: item.portions,
          },
        ];

    return batches.flatMap((batch, batchIndex) => {
      const count = batch.portions * item.ingredient.spritesPerPortion;

      return Array.from({ length: count }, (_, index) => {
        const baseSeed = hashSeed(
          `${item.ingredientId}:${item.area}:${batch.seed}:${index}`,
        );
        let point = spritePoint(baseSeed, item.area);

        if (shouldAvoidOverlap) {
          let bestPoint = point;
          let bestDistance = -1;
          const comparableSprites = placedSprites.filter(
            (placed) => placed.category !== 'cheese',
          );
          const separation = Math.min(minSeparation, sizePercent * 0.72);

          for (let attempt = 0; attempt < 12; attempt += 1) {
            const candidateSeed = hashSeed(`${baseSeed}:${attempt}`);
            const candidate = spritePoint(candidateSeed, item.area);
            const nearestDistance = comparableSprites.reduce(
              (nearest, placed) =>
                Math.min(nearest, distanceBetween(candidate, placed.point)),
              Infinity,
            );

            if (nearestDistance >= separation) {
              bestPoint = candidate;
              break;
            }

            if (nearestDistance > bestDistance) {
              bestDistance = nearestDistance;
              bestPoint = candidate;
            }
          }

          point = bestPoint;
        }
        const sprite = {
          key: `${item.ingredientId}-${item.area}-${batch.seed}-${batchIndex}-${index}`,
          imageUrl: item.ingredient.imageUrl,
          point,
          sizePercent,
        };

        placedSprites.push({ point, category: item.ingredient.category });
        return sprite;
      });
    });
  });
}

function buildCustomRecipe(selectedItems, selectedSize) {
  return {
    size: {
      id: selectedSize.id,
      name: selectedSize.name,
      diameterCm: selectedSize.diameterCm,
      slices: selectedSize.slices,
      portionMultiplier: selectedSize.portionMultiplier,
    },
    items: selectedItems.map((item) => ({
      ingredientId: item.ingredientId,
      name: item.ingredient.name,
      category: item.ingredient.category,
      area: item.area,
      areaLabel: formatArea(item.area),
      portions: item.portions,
      unit: item.ingredient.unit,
      portionQuantity: item.ingredient.portionQuantity,
      totalQuantity: ingredientTotalQuantity(item, selectedSize),
      unitPrice: item.ingredient.pricePerPortion,
      totalPrice:
        item.ingredient.pricePerPortion *
        item.portions *
        (selectedSize?.portionMultiplier || 1),
      visualMode: item.ingredient.visualMode,
      visualSizeCm: item.ingredient.visualSizeCm,
      spritesPerPortion: item.ingredient.spritesPerPortion,
      batches: item.batches || [],
    })),
  };
}

function createCustomCartItem({
  selectedSize,
  estimatedPrice,
  recipe,
  savedPizza = null,
}) {
  const baseName = `Pizza personalizada ${selectedSize.name}`;

  return {
    pizzaId: `custom-${savedPizza?.id || Date.now()}`,
    isCustom: true,
    savedPizzaId: savedPizza?.id,
    savedPizzaName: savedPizza?.name,
    name: savedPizza?.name || baseName,
    baseName,
    quantity: 1,
    unitPrice: estimatedPrice,
    totalPrice: estimatedPrice,
    customRecipe: recipe,
  };
}

function PizzaBuilder() {
  const dispatch = useDispatch();
  const customer = getStoredCustomer();
  const [sizes, setSizes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [selectedArea, setSelectedArea] = useState('whole');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selections, setSelections] = useState({});
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [saveName, setSaveName] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(function () {
    async function loadBuilderData() {
      try {
        setStatus('loading');
        setError('');
        const [nextSizes, nextIngredients] = await Promise.all([
          getBuilderPizzaSizes(),
          getBuilderIngredients(),
        ]);

        setSizes(nextSizes);
        setIngredients(nextIngredients);
        setSelectedSizeId(String(nextSizes[0]?.id || ''));
        setSelections(() => {
          const base = nextIngredients.find((item) => item.category === 'base');
          if (!base) return {};

          return {
            [selectionKey(base.id, 'whole')]: {
              ingredientId: base.id,
              area: 'whole',
              portions: 1,
              batches: [{ seed: createBatchSeed(base.id, 'whole'), portions: 1 }],
            },
          };
        });
        setStatus('idle');
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    }

    loadBuilderData();
  }, []);

  const selectedSize = sizes.find((size) => String(size.id) === selectedSizeId);

  const selectedItems = useMemo(
    () =>
      Object.values(selections)
        .map((selection) => ({
          ...selection,
          ingredient: ingredients.find(
            (ingredient) => ingredient.id === selection.ingredientId,
          ),
        }))
        .filter((selection) => selection.ingredient && selection.portions > 0),
    [ingredients, selections],
  );

  const estimatedPrice = useMemo(() => {
    const sizeMultiplier = selectedSize?.portionMultiplier || 1;
    const basePrice = selectedSize?.basePrice || 0;

    return selectedItems.reduce(
      (total, item) =>
        total + item.ingredient.pricePerPortion * item.portions * sizeMultiplier,
      basePrice,
    );
  }, [selectedItems, selectedSize]);

  const visibleIngredients = useMemo(
    () =>
      selectedCategory === 'all'
        ? ingredients
        : ingredients.filter((ingredient) => ingredient.category === selectedCategory),
    [ingredients, selectedCategory],
  );

  function changePortions(ingredient, delta) {
    const area = ingredient.supportsPartialArea ? selectedArea : 'whole';
    const key = selectionKey(ingredient.id, area);

    setSelections((current) => {
      const currentSelection = current[key] || {
        ingredientId: ingredient.id,
        area,
        portions: 0,
        batches: [],
      };
      const nextPortions = Math.max(
        0,
        Math.min(ingredient.maxPortions, currentSelection.portions + delta),
      );

      if (nextPortions === currentSelection.portions) return current;

      if (nextPortions === 0) {
        const next = { ...current };
        delete next[key];
        return next;
      }

      const currentBatches = currentSelection.batches || [];
      const nextBatches =
        delta > 0
          ? [
              ...currentBatches,
              { seed: createBatchSeed(ingredient.id, area), portions: 1 },
            ]
          : currentBatches.slice(0, -1);

      return {
        ...current,
        [key]: {
          ...currentSelection,
          portions: nextPortions,
          batches:
            nextBatches.length > 0
              ? nextBatches
              : [{ seed: createBatchSeed(ingredient.id, area), portions: nextPortions }],
        },
      };
    });
  }

  function handleAddCustomPizzaToCart() {
    if (!selectedSize || selectedItems.length === 0) return;

    const recipe = buildCustomRecipe(selectedItems, selectedSize);
    const cartItem = createCustomCartItem({
      selectedSize,
      estimatedPrice,
      recipe,
    });

    dispatch(addItem(cartItem));
    setCartMessage('Pizza personalizada agregada al carrito.');
  }

  async function handleSaveCustomPizza() {
    if (!selectedSize || selectedItems.length === 0 || !customer) return;
    if (!saveName.trim()) {
      setSaveMessage('Ponle un nombre a tu pizza.');
      return;
    }

    try {
      setSaveStatus('saving');
      setSaveMessage('');
      const baseName = `Pizza personalizada ${selectedSize.name}`;
      const recipe = buildCustomRecipe(selectedItems, selectedSize);
      const savedPizza = await createMySavedPizza({
        name: saveName.trim(),
        baseName,
        recipe,
        estimatedPrice,
      });

      dispatch(
        addItem(
          createCustomCartItem({
            selectedSize,
            estimatedPrice,
            recipe,
            savedPizza,
          }),
        ),
      );
      setSaveName('');
      setCartMessage('');
      setSaveMessage('Pizza guardada y agregada al carrito.');
      setSaveStatus('idle');
    } catch (err) {
      setSaveMessage(err.message);
      setSaveStatus('idle');
    }
  }

  if (status === 'loading') {
    return <p className="px-4 py-8 text-sm text-stone-500">Cargando constructor...</p>;
  }

  if (status === 'error') {
    return <p className="px-4 py-8 text-sm text-red-600">{error}</p>;
  }

  const layerItems = selectedItems.filter(
    (item) => item.ingredient.visualMode === 'layer',
  );
  const scatterItems = selectedItems.filter(
    (item) => item.ingredient.visualMode === 'scatter',
  );
  const scatterSprites = buildScatterSprites(scatterItems, selectedSize);

  function renderPizzaCanvas(maxWidthClass = 'max-w-[620px]', framed = true) {
    return (
      <div
        className={`mx-auto aspect-square w-full ${maxWidthClass} ${
          framed ? 'rounded-md bg-stone-100 p-3 sm:p-4' : 'p-0'
        }`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full bg-transparent">
          {layerItems.map((item) => (
            <img
              key={`${item.ingredientId}-${item.area}`}
              src={item.ingredient.imageUrl}
              alt={item.ingredient.name}
              className="absolute object-contain"
              style={{
                inset:
                  item.ingredient.category === 'base'
                    ? 0
                    : `${TOPPING_LAYER_INSET}%`,
                width:
                  item.ingredient.category === 'base'
                    ? '100%'
                    : `${100 - TOPPING_LAYER_INSET * 2}%`,
                height:
                  item.ingredient.category === 'base'
                    ? '100%'
                    : `${100 - TOPPING_LAYER_INSET * 2}%`,
                clipPath: areaClipPath(item.area),
              }}
            />
          ))}

          {scatterSprites.map((sprite) => (
            <img
              key={sprite.key}
              src={sprite.imageUrl}
              alt=""
              className="absolute object-contain"
              style={{
                width: `${sprite.sizePercent}%`,
                height: `${sprite.sizePercent}%`,
                left: `${sprite.point.left}%`,
                top: `${sprite.point.top}%`,
                transform: `translate(-50%, -50%) rotate(${sprite.point.rotation}deg) scale(${sprite.point.scale})`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  function renderSummaryCard() {
    return (
      <div className="mx-auto mt-5 max-w-[620px] rounded-md border border-stone-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">Precio estimado</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(estimatedPrice)}
            </p>
          </div>
          <p className="max-w-[190px] text-right text-xs text-stone-500">
            La pizza personalizada siempre es completa; las mitades solo cambian
            donde van los insumos.
          </p>
        </div>

        <ul className="mt-4 divide-y divide-stone-100 text-sm">
          {selectedItems.map((item) => (
            <li
              key={`${item.ingredientId}-${item.area}`}
              className="flex justify-between gap-4 py-2"
            >
              <span className="min-w-0">
                <span className="block font-semibold">
                  {item.ingredient.name} x{item.portions} - {formatArea(item.area)}
                </span>
                <span className="block text-xs text-stone-500">
                  {formatQuantity(ingredientTotalQuantity(item, selectedSize))}{' '}
                  {item.ingredient.unit}
                </span>
              </span>
              <span className="shrink-0 font-medium">
                {formatCurrency(
                  item.ingredient.pricePerPortion *
                    item.portions *
                    (selectedSize?.portionMultiplier || 1),
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="small" onClick={handleAddCustomPizzaToCart}>
            Agregar al carrito
          </Button>
          {cartMessage && (
            <p className="text-xs font-semibold text-green-700">{cartMessage}</p>
          )}
        </div>

        <div className="mt-5 border-t border-stone-200 pt-4">
          <p className="text-sm font-semibold">Guardar esta pizza</p>
          {customer ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Ej. La Alan Especial"
                className="input min-w-0 flex-1"
              />
              <Button
                type="small"
                onClick={handleSaveCustomPizza}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-xs text-stone-500">
              Inicia sesion para guardar tus creaciones.
            </p>
          )}
          {saveMessage && (
            <p className="mt-2 text-xs font-semibold text-stone-600">
              {saveMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <section className="sticky top-0 z-20 mb-5 rounded-md bg-stone-100/95 py-2 shadow-sm lg:hidden">
        {renderPizzaCanvas('max-w-[170px]', false)}
      </section>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Crea tu pizza</h1>
        <p className="text-sm text-stone-500">
          Arma tu pizza, revisa pesos y agregala al carrito.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
        <section className="space-y-5">
          <div className="rounded-md border border-stone-200 p-3 sm:p-4">
            <h2 className="mb-3 font-semibold">Tamano</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {sizes.map((size) => (
                <label
                  key={size.id}
                  className="min-w-0 rounded-md border border-stone-200 px-3 py-3 text-sm"
                >
                  <span className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="size"
                      value={size.id}
                      checked={selectedSizeId === String(size.id)}
                      onChange={(e) => setSelectedSizeId(e.target.value)}
                      className="mt-0.5 h-5 w-5 flex-none accent-yellow-400"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{size.name}</span>
                    <span className="text-xs text-stone-500">
                      {size.diameterCm} cm / {size.slices} tajadas
                    </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-stone-200 p-3 sm:p-4">
            <h2 className="mb-3 font-semibold">Area</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {areas.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setSelectedArea(value)}
                  className={`min-w-0 rounded-full border px-2 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${
                    selectedArea === value
                      ? 'border-yellow-400 bg-yellow-400 text-stone-900'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-stone-200 p-3 sm:p-4">
            <h2 className="mb-3 font-semibold">Insumos</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              {ingredientCategories.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setSelectedCategory(value)}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                    selectedCategory === value
                      ? 'border-stone-900 bg-stone-900 text-yellow-300'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {visibleIngredients.map((ingredient) => {
                const area = ingredient.supportsPartialArea ? selectedArea : 'whole';
                const selection = selections[selectionKey(ingredient.id, area)];
                const portions = selection?.portions || 0;

                return (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between gap-4 border-b border-stone-100 pb-3"
                  >
                    <div className="flex items-center gap-3">
                      {ingredient.imageUrl ? (
                        <img
                          src={ingredient.imageUrl}
                          alt={ingredient.name}
                          className="h-10 w-10 rounded bg-stone-100 object-contain"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-stone-100" />
                      )}
                      <div>
                        <p className="font-semibold">{ingredient.name}</p>
                        <p className="text-xs text-stone-500">
                          {ingredient.portionQuantity} {ingredient.unit} por porcion
                          {ingredient.supportsPartialArea
                            ? ` / ${formatArea(area)}`
                            : ' / completa'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => changePortions(ingredient, -1)}
                        className="h-8 w-8 rounded-full border border-stone-200 font-semibold"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-semibold">{portions}</span>
                      <button
                        type="button"
                        onClick={() => changePortions(ingredient, 1)}
                        className="h-8 w-8 rounded-full bg-yellow-400 font-semibold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
              {visibleIngredients.length === 0 && (
                <p className="rounded-md bg-stone-100 p-3 text-sm text-stone-500">
                  No hay insumos disponibles en esta categoria.
                </p>
              )}
            </div>
          </div>

          <div className="lg:hidden">{renderSummaryCard()}</div>
        </section>

        <section className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
          {renderPizzaCanvas()}
          {renderSummaryCard()}
        </section>
      </div>
    </div>
  );
}

export default PizzaBuilder;
