# Cosa Nostra Backend

API Express + PostgreSQL para el frontend de Cosa Nostra.

## Endpoints

- `GET /health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/menu`
- `GET /api/order/:id`
- `POST /api/order`
- `PATCH /api/order/:id`
- `GET /api/admin/pizzas`
- `POST /api/admin/pizzas`
- `PATCH /api/admin/pizzas/:id`
- `DELETE /api/admin/pizzas/:id`
- `POST /api/admin/pizzas/:id/image`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`

## Setup

1. Crea la base de datos `cosanostra` en PostgreSQL.
2. Copia `.env.example` a `.env` y ajusta `DATABASE_URL`.
3. Instala dependencias: `npm install`.
4. Sincroniza modelos y datos iniciales: `npm run db:sync`.
5. Levanta el servidor: `npm run dev`.

En desarrollo, el servidor también ejecuta `sequelize.sync({ alter: true })` al iniciar. Puedes desactivarlo con `DB_SYNC_ALTER=false`.

## Admin inicial

El seed crea un admin inicial usando estas variables:

```env
ADMIN_EMAIL=admin@cosanostra.local
ADMIN_PASSWORD=admin123
ADMIN_NAME=Cosa Nostra Admin
JWT_SECRET=dev-cosanostra-change-this-secret
```

Cambia esos valores en `.env` antes de usarlo fuera de desarrollo.

## Imagenes de pizzas

Las imagenes se suben a un bucket privado de S3 y el backend responde con URLs firmadas temporales.

Variables requeridas:

```env
AWS_REGION=us-east-2
AWS_S3_BUCKET=cosanostra-637423346014
AWS_S3_PIZZA_PREFIX=pizza_img
AWS_S3_PAYMENT_PREFIX=payment_proofs
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SIGNED_URL_EXPIRES_IN=3600
```

El usuario IAM necesita permisos sobre ambos prefijos:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": [
        "arn:aws:s3:::cosanostra-637423346014/pizza_img/*",
        "arn:aws:s3:::cosanostra-637423346014/payment_proofs/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::cosanostra-637423346014",
      "Condition": {
        "StringLike": {
          "s3:prefix": ["pizza_img/*", "payment_proofs/*"]
        }
      }
    }
  ]
}
```
