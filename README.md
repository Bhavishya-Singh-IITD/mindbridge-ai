# 🎨 Artisan Hub — Full Stack Art Marketplace

India's premier marketplace for original artwork. Built with React + Node.js + MongoDB.

---

## 📁 Project Structure

```
artisan-hub/
├── frontend/          ← React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/    (Header, Hero, ProductCard, etc.)
│   │   ├── context/       (StoreContext — cart & wishlist)
│   │   ├── data/          (mockData.js)
│   │   ├── pages/         (Home, Cart, Wishlist)
│   │   ├── services/      (api.js — all backend calls)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── backend/           ← Node.js + Express + MongoDB
    ├── src/
    │   ├── config/        (db.js, cloudinary.js)
    │   ├── controllers/   (auth, product, cart, order, user)
    │   ├── middleware/    (auth, errorHandler, upload)
    │   ├── models/        (User, Product, Order, Cart)
    │   ├── routes/        (all API routes)
    │   ├── utils/         (jwt.js, cloudinaryHelper.js, seeder.js)
    │   └── server.js
    └── package.json
```

---

## 🚀 Quick Start

### Step 1 — Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB locally → https://www.mongodb.com/try/download/community
  OR a free cloud cluster → https://www.mongodb.com/atlas

### Step 2 — Backend Setup

```bash
cd backend
npm install

# Copy the env file and fill in your values
cp .env.example .env
```

Open `.env` and set:
```
MONGO_URI=mongodb://localhost:27017/artisan_hub
JWT_SECRET=any_long_random_string_here
```

Start the backend:
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected: localhost
🚀 Server running in development mode on port 5000
```

**Seed the database with sample data:**
```bash
npm run seed
```

This creates:
- `admin@artisanhub.com`  / `admin123`
- `ananya@artisanhub.com` / `seller123`
- `buyer@artisanhub.com`  / `buyer123`
- 8 sample artworks

### Step 3 — Frontend Setup

```bash
cd frontend
npm install

cp .env.example .env
# .env already points to http://localhost:5000/api — no changes needed for local dev
```

Start the frontend:
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Reference

| Method | Endpoint                        | Auth      | Description               |
|--------|---------------------------------|-----------|---------------------------|
| POST   | `/api/auth/register`            | Public    | Create account            |
| POST   | `/api/auth/login`               | Public    | Login, returns JWT        |
| POST   | `/api/auth/logout`              | Public    | Clear cookie              |
| GET    | `/api/auth/me`                  | Protected | Get current user          |
| GET    | `/api/products`                 | Public    | List products (+ filters) |
| GET    | `/api/products/featured`        | Public    | Featured artworks         |
| GET    | `/api/products/:id`             | Public    | Single product detail     |
| POST   | `/api/products`                 | Seller    | Create product            |
| PUT    | `/api/products/:id`             | Seller    | Update product            |
| DELETE | `/api/products/:id`             | Seller    | Delete product            |
| POST   | `/api/products/:id/reviews`     | Buyer     | Add review                |
| GET    | `/api/cart`                     | Protected | Get user's cart           |
| POST   | `/api/cart`                     | Protected | Add item to cart          |
| PUT    | `/api/cart/:itemId`             | Protected | Update item quantity      |
| DELETE | `/api/cart/:itemId`             | Protected | Remove item               |
| DELETE | `/api/cart`                     | Protected | Clear cart                |
| POST   | `/api/orders`                   | Protected | Place order from cart     |
| GET    | `/api/orders/my`                | Protected | My order history          |
| GET    | `/api/orders/:id`               | Protected | Single order detail       |
| GET    | `/api/orders`                   | Admin     | All orders                |
| PUT    | `/api/orders/:id/status`        | Admin     | Update order status       |
| GET    | `/api/users/wishlist`           | Protected | Get wishlist              |
| POST   | `/api/users/wishlist/:productId`| Protected | Toggle wishlist item      |
| GET    | `/api/users`                    | Admin     | All users                 |

---

## 🛠️ Next Steps to Build

1. **Connect frontend to backend** — wire `StoreContext` to use `cartAPI` and `authAPI`
2. **Login / Register pages** — simple forms calling `authAPI.login()`
3. **Product Detail page** — `/product/:id` fetching from `productAPI.getOne()`
4. **Seller Dashboard** — upload artworks, view sales
5. **Checkout page** — shipping form + Razorpay payment integration
6. **Deploy** — Frontend on Vercel, Backend on Railway/Render, DB on MongoDB Atlas

---

## 🔒 Security Features Built-In

- JWT authentication with HTTP-only cookies
- Password hashing with bcryptjs (12 salt rounds)
- Rate limiting (100 req / 15 min per IP)
- MongoDB injection prevention (mongo-sanitize)
- HTTP security headers (helmet)
- Role-based access control (buyer / seller / admin)
- Input validation on all routes

---

## 📦 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS        |
| Routing   | React Router v6                     |
| HTTP      | Axios                               |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB, Mongoose ODM               |
| Auth      | JWT + bcryptjs                      |
| Images    | Cloudinary                          |
| Security  | Helmet, express-rate-limit          |
