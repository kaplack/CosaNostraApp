# CosaNostraApp Backlog

## Estado Actual: MVP operativo para piloto local

Objetivo: operar pedidos reales de una pizzeria pequena, manteniendo pedidos sin registro, pagos manuales y constructor visual de pizzas personalizadas.

## Contexto de Producto / Continuidad

Estoy trabajando en CosaNostraApp, monorepo PERN con frontend React/Vite y backend Express/Sequelize/PostgreSQL. Antes de proponer cambios, revisar este `BACKLOG.md` y el codigo actual.

El MVP ya tiene carta, pedidos sin registro, login opcional de cliente, admin, pagos Yape/Plin/efectivo, S3, builder de pizza personalizada y pizzas guardadas. La idea es continuar desde este backlog actual.

Decisiones base:

- Cosa Nostra es una pizzeria pequena, aprox. 30 pedidos semanales.
- El cliente siempre debe poder pedir sin registrarse.
- El login de cliente es opcional y sirve para historial, direcciones y pizzas guardadas.
- `Crea tu pizza` es el diferencial principal y debe tener prioridad visual en el home.
- El builder debe ser mobile-first.
- Las imagenes de insumos deben ser PNG/WebP con transparencia.
- S3 usa prefijos para organizar assets: `pizza_img/`, `ingredient_img/`, `payment_proofs/`, `payment_qr/`.
- La opcion de prioridad queda oculta por ahora.

### 1. Operacion de pedidos y pagos

- [x] Crear pedidos con estado `pending`.
- [x] Admin acepta o cancela pedidos.
- [x] Estados publicos:
  - `pending`: Pendiente de aceptacion.
  - `preparing`: En preparacion.
  - `on_the_way`: En camino.
  - `delivered`: Entregado.
  - `cancelled`: Cancelado.
- [x] Checkout con efectivo, Yape y Plin.
- [x] Efectivo con monto de pago y vuelto estimado.
- [x] Yape/Plin con comprobante obligatorio.
- [x] Subida de comprobantes a S3 en `payment_proofs/`.
- [x] Estado de pago: pendiente, por revisar, verificado, rechazado.
- [x] Bloquear aceptacion de Yape/Plin hasta verificar pago.
- [x] Miniatura y modal para comprobantes en admin.
- [x] Historial de eventos del pedido.
- [x] Seguimiento publico por codigo.
- [x] Ocultar prioridad del flujo publico por ahora.

### 2. Clientes

- [x] Registro/login opcional de clientes.
- [x] Mantener checkout como invitado.
- [x] Asociar pedidos a cliente si esta logueado.
- [x] Historial de pedidos por cliente.
- [x] Repetir pedido desde historial.
- [x] Guardar varias direcciones.
- [x] Elegir direccion guardada en checkout.
- [x] Guardar direccion nueva desde checkout.
- [x] Mis pizzas guardadas.

### 3. Admin base

- [x] CRUD de pizzas de carta.
- [x] CRUD de tamanos.
- [x] CRUD de insumos.
- [x] Configuracion de Yape/Plin:
  - Numero.
  - Titular.
  - QR.
  - Activo/inactivo.
- [x] Subida de QR a S3 en `payment_qr/`.
- [x] Admin pedidos con ficha de cocina para pizzas personalizadas.

### 4. Constructor de pizza

- [x] Pizza personalizada siempre es pizza completa.
- [x] Tamanos:
  - Familiar: 34 cm aprox, 8 tajadas, multiplicador `1`.
  - Personal: 24 cm aprox, 4 tajadas, multiplicador configurado.
- [x] Areas:
  - Toda.
  - Mitad izquierda.
  - Mitad derecha.
- [x] Insumos con:
  - Categoria.
  - Unidad: gr, ml, unit.
  - Cantidad por porcion.
  - Costo por porcion.
  - Precio por porcion.
  - Maximo por pizza.
  - Disponible/activo.
- [x] Visuales de insumos:
  - `visualMode`: capa o disperso.
  - `spritesPerPortion`.
  - `visualSizeCm`.
  - `supportsPartialArea`.
- [x] Imagen transparente PNG/WebP para insumos en S3 `ingredient_img/`.
- [x] Render visual de capas y sprites.
- [x] Evitar cornicione en toppings.
- [x] Escala visual segun diametro real de pizza.
- [x] Distribucion por tandas al presionar `+`.
- [x] Separacion minima por categoria:
  - Proteina fuerte.
  - Vegetal media.
  - Queso baja o sin colision.
- [x] Precio estimado.
- [x] Peso/cantidad total por ingrediente.
- [x] Agregar pizza personalizada al carrito.
- [x] Guardar pizza personalizada con nombre.
- [x] Pedidos guardan snapshot completo de receta.

### 5. Experiencia publica

- [x] Home con `Crea tu pizza` como hero principal.
- [x] Header con navegacion:
  - Crea tu pizza.
  - Carta.
  - Pedido.
  - Usuario compacto.
- [x] Menu de usuario con:
  - Mis pedidos.
  - Mis pizzas.
  - Mis direcciones.
  - Logout.
- [x] Footer publico.
- [x] Carta con CTA hacia constructor.

## Sprint Siguiente Recomendado: Pulido MVP y piloto real

Objetivo: dejar la app lista para pruebas con pedidos reales supervisados.

- [ ] Probar flujo completo desde celular:
  - Pizza de carta.
  - Pizza personalizada sin login.
  - Pizza personalizada con login.
  - Guardar pizza.
  - Repetir pizza guardada.
  - Pago efectivo.
  - Pago Yape/Plin.
- [ ] Revisar responsive fino:
  - Header mobile.
  - Builder mobile.
  - Checkout mobile.
  - Admin pedidos en pantalla pequena.
- [ ] Completar datos reales:
  - Horarios.
  - WhatsApp.
  - Zonas de reparto.
  - QR reales.
  - Titulares de pago.
- [ ] Mejorar mensajes de error para cliente.
- [ ] Agregar mensaje de respaldo: si hay problema, escribir por WhatsApp.
- [ ] Revisar seguridad basica:
  - Password admin fuerte.
  - Variables `.env`.
  - CORS.
  - Limites de subida.
- [ ] Preparar backup/export de base de datos.

### Avance de validacion del piloto - 21/07/2026

- [x] Validar por API pizza personalizada como invitado y snapshot de receta.
- [x] Validar efectivo, monto recibido, seguimiento y ciclo completo de estados.
- [x] Validar Yape/Plin, subida de comprobante, verificacion y bloqueo de aceptacion.
- [x] Validar registro/login de cliente y asociacion de pedidos a su cuenta.
- [x] Validar direccion predeterminada, pizza guardada, historial y repeticion.
- [x] Corregir repeticion para conservar referencia a la pizza guardada.
- [x] Limpiar visualmente el input de imagen al guardar o cancelar una pizza de carta.
- [x] Agregar layout admin con sidebar y navegacion compartida.
- [x] Restringir transiciones de pedidos y bloquear avances sin pago verificado.
- [ ] Repetir estos escenarios desde la interfaz en un celular real.

### Dashboard operativo del admin

Objetivo: convertir el panel de entrada en un resumen util para tomar decisiones rapidas sin revisar cada modulo.

- [ ] Agregar tarjetas de indicadores:
  - Pedidos de hoy.
  - Pedidos pendientes y en preparacion.
  - Ventas de hoy y de la semana.
  - Pagos digitales por revisar.
  - Clientes registrados.
  - Pizzas activas y agotadas.
- [ ] Agregar resumen de pedidos por estado.
- [ ] Mostrar pedidos recientes con acceso directo al detalle.
- [ ] Mostrar pizzas mas pedidas y pizzas personalizadas mas repetidas.
- [ ] Agregar selector de periodo: hoy, 7 dias y 30 dias.
- [ ] Definir e instrumentar analitica de visitas antes de mostrar metricas web:
  - Visitas totales y visitantes unicos.
  - Visitas a carta y constructor.
  - Inicio de checkout y pedidos completados.
  - Tasa de conversion de visita a pedido.
- [ ] Evitar almacenar datos personales innecesarios en la analitica.

## Fase Social: Creador de pizzas y comunidad

Objetivo: convertir el constructor en una experiencia compartible que diferencie a Cosa Nostra.

### 1. Pizzas publicas compartibles

- [ ] Permitir marcar una pizza guardada como publica/privada.
- [ ] Crear slug publico para pizza guardada.
- [ ] Pagina publica `/p/:slug`.
- [ ] Mostrar:
  - Nombre de la pizza.
  - Autor.
  - Tamano.
  - Render o imagen.
  - Receta resumida.
  - Precio estimado.
  - Boton `Pedir esta pizza`.
- [ ] Boton `Ordenar esta pizza` agrega la receta compartida al carrito como pizza personalizada.
- [ ] Mantener referencia al creador original de la pizza compartida.
- [ ] Compartir enlace por WhatsApp, Facebook y copiar link.
- [ ] Preparar compartir visual para Instagram/TikTok como captura o asset.

### 2. Foto real de la pizza hecha

- [ ] Permitir al cliente subir foto real de una pizza recibida.
- [ ] Solo permitir subir foto desde pedido propio.
- [ ] Asociar foto a:
  - Usuario.
  - Pedido.
  - Pizza personalizada guardada si existe.
- [ ] Subir foto a S3 con prefijo `customer_pizza_photos/`.
- [ ] Estados de moderacion:
  - `pending`.
  - `approved`.
  - `rejected`.
- [ ] Admin aprueba/rechaza fotos antes de publicarlas.
- [ ] Mostrar fotos aprobadas en:
  - Pagina publica de pizza.
  - Home.
  - Galeria de creaciones.

### 3. Home con creaciones de clientes

- [ ] Agregar seccion `Creaciones de la comunidad`.
- [ ] Mostrar pizzas publicas aprobadas.
- [ ] Priorizar:
  - Con foto real.
  - Mas recientes.
  - Mas pedidas.
  - Mas likes.
- [ ] CTA: `Crea la tuya`.

### 4. Likes

- [ ] Permitir like a pizzas publicas.
- [ ] Definir si requiere login o permite anonimo con limite.
- [ ] Mostrar contador de likes.
- [ ] Ranking semanal/mensual.

### 5. Comentarios

- [ ] Permitir comentarios en pizzas publicas.
- [ ] Requerir login para comentar.
- [ ] Moderacion admin.
- [ ] Reportar comentario.
- [ ] Ocultar comentarios rechazados.

## Fase Ofertas y marketing

- [ ] Ofertas administrables.
- [ ] Ofertas visibles en home.
- [ ] Ofertas con fecha de inicio/fin.
- [ ] QR desde admin:
  - Carta/menu.
  - Crea tu pizza.
  - Pizza publica.
  - Campania/oferta.
- [ ] Descargar QR como PNG.
- [ ] Copiar link destino.

## Fase Integraciones

### Cuenta compartida con Vincu

- [ ] Evaluar si Cosa Nostra y Vincu deben compartir identidad de usuarios.
- [ ] Definir estrategia:
  - Base de usuarios compartida.
  - Servicio de autenticacion central.
  - Sincronizacion por API entre apps.
- [ ] Mantener compatibilidad con pedidos sin registro en Cosa Nostra.
- [ ] Definir identificador principal:
  - Email.
  - Telefono.
  - Ambos.
- [ ] Resolver duplicados entre usuarios existentes de ambas apps.
- [ ] Definir roles y permisos separados por producto:
  - Cliente Cosa Nostra.
  - Admin Cosa Nostra.
  - Usuario Vincu.
- [ ] Evaluar login social o SSO en una fase posterior.

### Puntos Vincu por pizzas compartidas

- [ ] Generar evento cuando un usuario comparte una pizza publica.
- [ ] Generar evento cuando otra persona ordena una pizza compartida.
- [ ] Otorgar puntos Vincu al creador original cuando su pizza compartida sea ordenada.
- [ ] Definir momento valido para otorgar puntos:
  - Al aceptar el pedido.
  - Al entregar el pedido.
- [ ] Evitar puntos por clicks o carritos abandonados.
- [ ] Registrar relacion:
  - Pizza compartida.
  - Creador original.
  - Pedido generado.
  - Comprador logueado o invitado.
- [ ] Evaluar si el comprador tambien recibe puntos por probar una pizza compartida.
- [ ] Decidir experiencia de Vincu dentro de Cosa Nostra:
  - Embebido de Vincu.
  - UI propia consultando datos de Vincu.
  - Redireccion a Vincu.

## Pendientes Tecnicos

- [x] Bug menor: limpiar visualmente input file en admin de insumos despues de guardar.
- [ ] Considerar `useMemo` para sprites si el builder vuelve a sentirse pesado.
- [ ] Extraer componentes reutilizables para receta personalizada.
- [ ] Eliminar o reutilizar `updateOrder` API si prioridad queda fuera definitivamente.
- [ ] Revisar acentos/ASCII si se decide normalizar textos finales.
