# Online Pharmacy

This project now includes a full **Node.js + Express + MongoDB backend** for an online pharmacy workflow.

## Backend features

- JWT authentication (register/login/me)
- Medicines CRUD (admin protected for write operations)
- Cart APIs (add/update/remove/clear)
- Checkout API (creates order from cart, applies tax/shipping, updates stock)
- Orders APIs (user + admin views)
- Prescription upload (JPG/PNG/PDF) + admin verification endpoint

## Project scripts

- `npm run dev` → run Vite frontend
- `npm run build` → build frontend
- `npm run preview` → preview frontend build
- `npm run server` → run backend API server

## Environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/online-pharmacy
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

## Install and run

```bash
npm install
npm run server
```

Backend base URL: `http://localhost:5000`

## REST API routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)

### Medicines
- `GET /api/medicines`
- `GET /api/medicines/:id`
- `POST /api/medicines` (admin)
- `PUT /api/medicines/:id` (admin)
- `DELETE /api/medicines/:id` (admin)

### Cart
- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:medicineId`
- `DELETE /api/cart/items/:medicineId`
- `DELETE /api/cart`

### Orders
- `GET /api/orders/my`
- `GET /api/orders/:id`
- `GET /api/orders` (admin)
- `PATCH /api/orders/:id/status` (admin)

### Checkout
- `POST /api/checkout`

### Prescriptions
- `POST /api/prescriptions/upload` (form-data key: `prescription`)
- `PATCH /api/prescriptions/orders/:id/verify` (admin)

## Notes

- Protected endpoints require `Authorization: Bearer <token>`.
- Uploaded prescriptions are served from `/uploads/...`.
