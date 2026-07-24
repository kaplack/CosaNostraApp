import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  FiArrowLeft,
  FiCircle,
  FiList,
  FiMinus,
  FiPackage,
  FiPlus,
  FiShoppingCart,
} from 'react-icons/fi';
import {
  GiCarrot,
  GiCheeseWedge,
  GiFullPizza,
  GiHerbsBundle,
  GiSteak,
  GiTomato,
} from 'react-icons/gi';
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
const mobileCategoryIcons = {
  base: GiFullPizza,
  sauce: GiTomato,
  cheese: GiCheeseWedge,
  protein: GiSteak,
  vegetable: GiCarrot,
  extra: GiHerbsBundle,
};
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

function ingredientSelectorImage(ingredient) {
  return ingredient.selectorImageUrl || ingredient.imageUrl;
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
  const sizeMultiplier = selectedSize?.portionMultiplier || 1;

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
      const rawCount =
        batch.portions * item.ingredient.spritesPerPortion * sizeMultiplier;
      const count =
        item.ingredient.spritesPerPortion === 0
          ? 0
          : Math.max(1, Math.round(rawCount));

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
  const [lastSavedPizza, setLastSavedPizza] = useState(null);
  const [mobileTab, setMobileTab] = useState('pizza');
  const [mobileStep, setMobileStep] = useState('categories');
  const [mobileIngredientId, setMobileIngredientId] = useState(null);

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

  const mobileCategories = useMemo(
    () =>
      ingredientCategories
        .filter(([value]) => value !== 'all')
        .filter(([value]) => ingredients.some((ingredient) => ingredient.category === value)),
    [ingredients],
  );

  const mobileIngredients = useMemo(
    () => ingredients.filter((ingredient) => ingredient.category === selectedCategory),
    [ingredients, selectedCategory],
  );

  const mobileIngredient = ingredients.find(
    (ingredient) => ingredient.id === mobileIngredientId,
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

  function openMobileCategory(category) {
    setSelectedCategory(category);
    setMobileIngredientId(null);
    setMobileStep('ingredients');
  }

  function openMobileIngredient(ingredient) {
    const area = ingredient.supportsPartialArea ? selectedArea : 'whole';
    const portions = selections[selectionKey(ingredient.id, area)]?.portions || 0;

    if (portions === 0) changePortions(ingredient, 1);
    setMobileIngredientId(ingredient.id);
    setMobileStep('ingredient');
  }

  function goBackMobileControls() {
    if (mobileStep === 'ingredient') {
      setMobileIngredientId(null);
      setMobileStep('ingredients');
      return;
    }

    setSelectedCategory('all');
    setMobileStep('categories');
  }

  function handleAddCustomPizzaToCart() {
    if (!selectedSize || selectedItems.length === 0) return;

    const recipe = buildCustomRecipe(selectedItems, selectedSize);
    const matchingSavedPizza =
      lastSavedPizza &&
      JSON.stringify(lastSavedPizza.recipe) === JSON.stringify(recipe)
        ? lastSavedPizza
        : null;
    const cartItem = createCustomCartItem({
      selectedSize,
      estimatedPrice,
      recipe,
      savedPizza: matchingSavedPizza,
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

      setLastSavedPizza(savedPizza);
      setSaveName('');
      setCartMessage('');
      setSaveMessage('Pizza guardada. Puedes agregarla al carrito cuando quieras.');
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

  function renderPizzaCanvas(
    maxWidthClass = 'max-w-[620px]',
    framed = true,
    interactiveArea = false,
  ) {
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

          {interactiveArea && (
            <div className="absolute inset-[9%] z-20 rounded-full" aria-label="Selecciona dónde colocar el ingrediente">
              <button
                type="button"
                onClick={() => setSelectedArea('left')}
                aria-label="Aplicar en la mitad izquierda"
                aria-pressed={selectedArea === 'left'}
                className={`absolute inset-y-0 left-0 w-1/2 rounded-l-full border-y-2 border-l-2 border-dashed transition ${selectedArea === 'left' ? 'border-[#d7261e] bg-[#d7261e]/15' : 'border-transparent hover:border-stone-950/40'}`}
              />
              <button
                type="button"
                onClick={() => setSelectedArea('right')}
                aria-label="Aplicar en la mitad derecha"
                aria-pressed={selectedArea === 'right'}
                className={`absolute inset-y-0 right-0 w-1/2 rounded-r-full border-y-2 border-r-2 border-dashed transition ${selectedArea === 'right' ? 'border-[#d7261e] bg-[#d7261e]/15' : 'border-transparent hover:border-stone-950/40'}`}
              />
              <button
                type="button"
                onClick={() => setSelectedArea('whole')}
                aria-label="Aplicar en toda la pizza"
                aria-pressed={selectedArea === 'whole'}
                className={`absolute left-1/2 top-1/2 z-10 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-dashed text-[10px] font-black uppercase transition ${selectedArea === 'whole' ? 'border-[#d7261e]/70 bg-[#d7261e]/[0.07] text-[#a51f19]/80' : 'border-stone-500/50 bg-[#fff8e8]/60 text-stone-600'}`}
              >
                Toda
              </button>
            </div>
          )}
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

  const mobileIngredientArea = mobileIngredient?.supportsPartialArea
    ? selectedArea
    : 'whole';
  const mobileIngredientPortions = mobileIngredient
    ? selections[selectionKey(mobileIngredient.id, mobileIngredientArea)]?.portions || 0
    : 0;

  return (
    <div>
      <section className="cn-paper flex min-h-[calc(100dvh-62px)] flex-col border-x-[3px] border-stone-950 lg:hidden">
        <header className="flex items-center justify-between gap-3 border-b-[3px] border-stone-950 bg-[#f9bd16] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em]">Laboratorio Cosa Nostra</p>
            <h1 className="cn-display truncate text-3xl uppercase italic leading-none">Crea tu pizza</h1>
          </div>
          <div className="shrink-0 border-[3px] border-stone-950 bg-[#fff8e8] px-3 py-2 text-right shadow-[3px_3px_0_#111312]">
            <p className="text-[9px] font-black uppercase text-stone-500">Total</p>
            <p className="font-black text-[#d7261e]">{formatCurrency(estimatedPrice)}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 border-b-[3px] border-stone-950 bg-stone-950 p-1">
          <button type="button" onClick={() => setMobileTab('pizza')} className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase ${mobileTab === 'pizza' ? 'bg-[#f9bd16] text-stone-950' : 'text-white'}`}>
            <FiCircle /> Pizza
          </button>
          <button type="button" onClick={() => setMobileTab('detail')} className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase ${mobileTab === 'detail' ? 'bg-[#f9bd16] text-stone-950' : 'text-white'}`}>
            <FiList /> Detalle <span className="rounded-full bg-[#d7261e] px-1.5 py-0.5 text-[9px] text-white">{selectedItems.length}</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b-[3px] border-stone-950 bg-[#fff8e8] px-3 py-2">
          {sizes.map((size) => (
            <button
              type="button"
              key={size.id}
              onClick={() => setSelectedSizeId(String(size.id))}
              className={`shrink-0 border-2 border-stone-950 px-3 py-1.5 text-[10px] font-black uppercase ${selectedSizeId === String(size.id) ? 'bg-stone-950 text-[#f9bd16]' : 'bg-white text-stone-700'}`}
            >
              {size.name} · {size.diameterCm} cm
            </button>
          ))}
        </div>

        {mobileTab === 'pizza' ? (
          <div className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-hidden px-9 py-3">
            <div className="absolute left-2 top-3 z-30 flex max-h-[70%] w-12 flex-col gap-2 overflow-y-auto" aria-label="Ingredientes agregados">
              {selectedItems.filter((item) => item.ingredient.category !== 'base').map((item) => (
                <button
                  type="button"
                  key={`${item.ingredientId}-${item.area}`}
                  onClick={() => {
                    setSelectedCategory(item.ingredient.category);
                    setMobileIngredientId(item.ingredient.id);
                    setMobileStep('ingredient');
                  }}
                  className="relative grid h-11 w-11 shrink-0 place-items-center border-[2px] border-stone-950 bg-white shadow-[2px_2px_0_#111312]"
                  aria-label={`Editar ${item.ingredient.name}, ${formatArea(item.area)}`}
                >
                  {ingredientSelectorImage(item.ingredient) && <img src={ingredientSelectorImage(item.ingredient)} alt="" className="h-9 w-9 object-contain" />}
                  <span className="absolute -right-1 -top-1 rounded-full border border-stone-950 bg-[#f9bd16] px-1 text-[9px] font-black">{item.portions}</span>
                </button>
              ))}
            </div>

            <div className="w-full max-w-[390px]">
              {renderPizzaCanvas('max-w-[390px]', false, true)}
              <p className="mt-1 text-center text-[10px] font-black uppercase tracking-[0.08em] text-stone-600">
                Área: <span className="text-[#d7261e]">{formatArea(selectedArea)}</span> · toca la pizza para cambiar
              </p>
            </div>
          </div>
        ) : (
          <div className="min-h-[300px] flex-1 overflow-y-auto p-4">
            <div className="border-[3px] border-stone-950 bg-[#fff8e8] shadow-[5px_5px_0_#111312]">
              <div className="flex items-center justify-between border-b-[3px] border-stone-950 bg-[#f9bd16] px-4 py-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em]">Tu receta</p>
                  <h2 className="cn-display text-2xl uppercase italic">{selectedSize?.name}</h2>
                </div>
                <p className="font-black text-[#d7261e]">{formatCurrency(estimatedPrice)}</p>
              </div>
              <ul className="divide-y-2 divide-stone-300 px-4">
                {selectedItems.map((item) => (
                  <li key={`${item.ingredientId}-${item.area}`} className="flex items-center justify-between gap-3 py-3 text-xs">
                    <span className="min-w-0">
                      <span className="block font-black uppercase">{item.ingredient.name} × {item.portions}</span>
                      <span className="text-stone-500">{formatArea(item.area)} · {formatQuantity(ingredientTotalQuantity(item, selectedSize))} {item.ingredient.unit}</span>
                    </span>
                    <span className="shrink-0 font-black">{formatCurrency(item.ingredient.pricePerPortion * item.portions * (selectedSize?.portionMultiplier || 1))}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 border-[3px] border-stone-950 bg-white p-4">
              <p className="text-xs font-black uppercase">Guardar esta pizza</p>
              {customer ? (
                <div className="mt-3 flex gap-2">
                  <input value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder="Ponle un nombre" className="min-w-0 flex-1 border-[2px] border-stone-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#f9bd16]" />
                  <button type="button" onClick={handleSaveCustomPizza} disabled={saveStatus === 'saving'} className="border-[2px] border-stone-950 bg-[#f9bd16] px-3 text-[10px] font-black uppercase disabled:opacity-60">{saveStatus === 'saving' ? 'Guardando' : 'Guardar'}</button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-stone-500">Inicia sesión para guardar tus creaciones.</p>
              )}
              {saveMessage && <p className="mt-2 text-xs font-bold text-stone-600">{saveMessage}</p>}
            </div>
          </div>
        )}

        <div className="border-t-[3px] border-stone-950 bg-[#f9bd16]">
          <div className="flex min-h-[116px] items-center px-3 py-3">
            {mobileStep !== 'categories' && (
              <button type="button" onClick={goBackMobileControls} className="mr-2 grid h-12 w-10 shrink-0 place-items-center border-[2px] border-stone-950 bg-[#fff8e8] shadow-[2px_2px_0_#111312]" aria-label="Volver">
                <FiArrowLeft />
              </button>
            )}

            {mobileStep === 'categories' && (
              <div className="flex w-full gap-2 overflow-x-auto pb-1">
                {mobileCategories.map(([value, label]) => {
                  const Icon = mobileCategoryIcons[value] || FiPackage;
                  return (
                    <button type="button" key={value} onClick={() => openMobileCategory(value)} className="flex min-w-[74px] shrink-0 flex-col items-center gap-1 border-[2px] border-stone-950 bg-[#fff8e8] px-2 py-2 text-[9px] font-black uppercase shadow-[2px_2px_0_#111312]">
                      <Icon className="text-xl" /> {label}
                    </button>
                  );
                })}
              </div>
            )}

            {mobileStep === 'ingredients' && (
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
                {mobileIngredients.map((ingredient) => {
                  const area = ingredient.supportsPartialArea ? selectedArea : 'whole';
                  const portions = selections[selectionKey(ingredient.id, area)]?.portions || 0;
                  return (
                    <button type="button" key={ingredient.id} onClick={() => openMobileIngredient(ingredient)} className={`relative flex min-w-[78px] shrink-0 flex-col items-center border-[2px] border-stone-950 px-2 py-2 text-[9px] font-black uppercase shadow-[2px_2px_0_#111312] ${portions ? 'bg-stone-950 text-white' : 'bg-[#fff8e8]'}`}>
                      {ingredientSelectorImage(ingredient) ? <img src={ingredientSelectorImage(ingredient)} alt="" className="h-11 w-11 object-contain" /> : <span className="h-11" />}
                      <span className="mt-1 max-w-[70px] truncate">{ingredient.name}</span>
                      {portions > 0 && <span className="absolute right-1 top-1 rounded-full bg-[#d7261e] px-1.5 py-0.5 text-[9px] text-white">{portions}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {mobileStep === 'ingredient' && mobileIngredient && (
              <div className="flex min-w-0 flex-1 items-center gap-3 border-[2px] border-stone-950 bg-[#fff8e8] p-2 shadow-[2px_2px_0_#111312]">
                {ingredientSelectorImage(mobileIngredient) && <img src={ingredientSelectorImage(mobileIngredient)} alt="" className="h-14 w-14 shrink-0 object-contain" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black uppercase">{mobileIngredient.name}</p>
                  <p className="text-[10px] font-semibold text-stone-500">{formatArea(mobileIngredientArea)} · {formatQuantity(mobileIngredient.portionQuantity * mobileIngredientPortions * (selectedSize?.portionMultiplier || 1))} {mobileIngredient.unit}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => changePortions(mobileIngredient, -1)} disabled={mobileIngredientPortions === 0} className="grid h-10 w-10 place-items-center rounded-full border-[2px] border-stone-950 bg-white disabled:opacity-30" aria-label={`Quitar ${mobileIngredient.name}`}><FiMinus /></button>
                  <span className="w-5 text-center font-black">{mobileIngredientPortions}</span>
                  <button type="button" onClick={() => changePortions(mobileIngredient, 1)} disabled={mobileIngredientPortions >= mobileIngredient.maxPortions} className="grid h-10 w-10 place-items-center rounded-full border-[2px] border-stone-950 bg-[#d7261e] text-white disabled:opacity-30" aria-label={`Agregar ${mobileIngredient.name}`}><FiPlus /></button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 border-t-[3px] border-stone-950 bg-[#d7261e] px-3 py-2 text-white">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.12em]">{selectedItems.length} ingredientes</p>
              <p className="font-black">{formatCurrency(estimatedPrice)}</p>
            </div>
            <button type="button" onClick={handleAddCustomPizzaToCart} className="inline-flex items-center gap-2 border-[2px] border-stone-950 bg-[#f9bd16] px-4 py-2 text-xs font-black uppercase text-stone-950 shadow-[2px_2px_0_#111312]">
              <FiShoppingCart /> Agregar
            </button>
          </div>
          {(cartMessage || saveMessage) && <p className="bg-stone-950 px-3 py-1.5 text-center text-[10px] font-bold text-white">{cartMessage || saveMessage}</p>}
        </div>
      </section>

      <div className="hidden px-4 py-6 lg:block">
        <div className="mb-6">
          <h1 className="cn-display text-5xl uppercase italic">Crea tu pizza</h1>
          <p className="text-sm text-stone-500">Arma tu pizza, revisa pesos y agrégala al carrito.</p>
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
                      {ingredientSelectorImage(ingredient) ? (
                        <img
                          src={ingredientSelectorImage(ingredient)}
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

        </section>

        <section className="sticky top-6 self-start">
          {renderPizzaCanvas()}
          {renderSummaryCard()}
        </section>
        </div>
      </div>
    </div>
  );
}

export default PizzaBuilder;
