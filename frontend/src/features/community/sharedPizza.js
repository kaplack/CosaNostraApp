export function createSharedPizzaCartItem(pizza, creator) {
  return {
    pizzaId: `custom-shared-${pizza.id}-${Date.now()}`,
    isCustom: true,
    isShared: true,
    savedPizzaId: pizza.id,
    originalCreatorId: creator.id,
    sharedPizzaSlug: pizza.slug,
    savedPizzaName: pizza.name,
    name: pizza.name,
    baseName: pizza.baseName,
    quantity: 1,
    unitPrice: pizza.estimatedPrice,
    totalPrice: pizza.estimatedPrice,
    customRecipe: pizza.recipe,
  };
}
