# CosaNostraApp

Monorepo PERN para Cosa Nostra.

- `frontend`: React + Vite + Tailwind.
- `backend`: Node.js + Express + PostgreSQL.

## Desarrollo

Backend:

```bash
cd backend
npm install
copy .env.example .env
npm run db:sync
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Admin local:

```text
http://localhost:5173/admin/login
```

Gestion de pizzas:

```text
http://localhost:5173/admin/pizzas
```

Gestion de pedidos:

```text
http://localhost:5173/admin/orders
```

Las imagenes de pizzas se guardan en S3 bajo el prefijo:

```text
pizza_img/
```

Credenciales por defecto de desarrollo:

```text
admin@cosanostra.local
admin123
```

Backlog del producto:

```text
BACKLOG.md
```
