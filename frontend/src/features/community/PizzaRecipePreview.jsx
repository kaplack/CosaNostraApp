const LAYER_INSET = 11;

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

function pointFor(seed, area) {
  const random = seededRandom(seed);
  let x = 50;
  let y = 50;
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 4 + Math.sqrt(random()) * 30;
    x = 50 + Math.cos(angle) * radius;
    y = 50 + Math.sin(angle) * radius;
    if (area === 'whole' || (area === 'left' && x <= 50) || (area === 'right' && x >= 50)) break;
  }
  return { x, y, rotation: random() * 360, scale: 0.75 + random() * 0.3 };
}

function areaClipPath(area) {
  if (area === 'left') return 'inset(0 50% 0 0)';
  if (area === 'right') return 'inset(0 0 0 50%)';
  return 'none';
}

function PizzaRecipePreview({ recipe, className = '' }) {
  const sizeMultiplier = recipe.size?.portionMultiplier || 1;
  const layerItems = recipe.items.filter((item) => item.visualMode === 'layer' && item.imageUrl);
  const scatterItems = recipe.items.filter((item) => item.visualMode === 'scatter' && item.imageUrl);
  const sprites = scatterItems.flatMap((item) => {
    const count = item.spritesPerPortion === 0
      ? 0
      : Math.max(1, Math.round(item.portions * item.spritesPerPortion * sizeMultiplier));
    const sizePercent = ((item.visualSizeCm || 4.5) / (recipe.size?.diameterCm || 34)) * 100;
    return Array.from({ length: count }, (_, index) => ({
      key: `${item.ingredientId}-${item.area}-${index}`,
      imageUrl: item.imageUrl,
      point: pointFor(hashSeed(`${item.ingredientId}:${item.area}:${index}`), item.area),
      sizePercent,
    }));
  });

  return (
    <div className={`relative mx-auto aspect-square w-full ${className}`}>
      <div className="relative h-full w-full overflow-hidden rounded-full">
        {layerItems.map((item) => (
          <img
            key={`${item.ingredientId}-${item.area}`}
            src={item.imageUrl}
            alt={item.name}
            className="absolute object-contain"
            style={{
              inset: item.category === 'base' ? 0 : `${LAYER_INSET}%`,
              width: item.category === 'base' ? '100%' : `${100 - LAYER_INSET * 2}%`,
              height: item.category === 'base' ? '100%' : `${100 - LAYER_INSET * 2}%`,
              clipPath: areaClipPath(item.area),
            }}
          />
        ))}
        {sprites.map((sprite) => (
          <img
            key={sprite.key}
            src={sprite.imageUrl}
            alt=""
            className="absolute object-contain"
            style={{
              width: `${sprite.sizePercent}%`,
              height: `${sprite.sizePercent}%`,
              left: `${sprite.point.x}%`,
              top: `${sprite.point.y}%`,
              transform: `translate(-50%, -50%) rotate(${sprite.point.rotation}deg) scale(${sprite.point.scale})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default PizzaRecipePreview;
