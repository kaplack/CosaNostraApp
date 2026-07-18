INSERT INTO menu_items (id, name, unit_price, ingredients, sold_out, image_url) VALUES
  (1, 'Margherita', 18.00, ARRAY['tomato', 'mozzarella', 'basil'], false, 'https://react-fast-pizza-api.onrender.com/pizzas/margherita.webp'),
  (2, 'Capricciosa', 22.00, ARRAY['tomato', 'mozzarella', 'ham', 'mushrooms', 'artichoke'], false, 'https://react-fast-pizza-api.onrender.com/pizzas/capricciosa.webp'),
  (3, 'Romana', 20.00, ARRAY['tomato', 'mozzarella', 'prosciutto'], false, 'https://react-fast-pizza-api.onrender.com/pizzas/romana.webp'),
  (4, 'Prosciutto e Rucola', 24.00, ARRAY['tomato', 'mozzarella', 'prosciutto', 'arugula'], false, 'https://react-fast-pizza-api.onrender.com/pizzas/prosciutto-e-rucola.webp'),
  (5, 'Diavola', 21.00, ARRAY['tomato', 'mozzarella', 'spicy salami', 'chili flakes'], false, 'https://react-fast-pizza-api.onrender.com/pizzas/diavola.webp'),
  (6, 'Vegetale', 19.00, ARRAY['tomato', 'mozzarella', 'peppers', 'onion', 'mushrooms'], false, 'https://react-fast-pizza-api.onrender.com/pizzas/vegetale.webp')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  unit_price = EXCLUDED.unit_price,
  ingredients = EXCLUDED.ingredients,
  sold_out = EXCLUDED.sold_out,
  image_url = EXCLUDED.image_url,
  updated_at = now();
