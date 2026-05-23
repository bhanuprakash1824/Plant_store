# E-PlantShopping Full-Stack Upgrade

The E-PlantShopping platform has been successfully transformed from a static frontend-only site into a full-stack e-commerce marketplace powered by React, Node.js, Express, and MongoDB.

## What's New?

### 1. Three Distinct User Roles
- **🌱 Producers**: Can register, add new plant listings, set prices and stock quantities, edit/delete their own listings, and track their sales revenue.
- **🛍️ Consumers**: Can browse a live marketplace, add items to a real-time cart, and safely check out.
- **👑 Owner**: A centralized admin dashboard to track total platform revenue, manage users, monitor all plant listings, and review a comprehensive audit log.

### 2. Optimistic Concurrency Control (OCC)
We implemented OCC to handle race conditions safely. When a consumer adds a plant to their cart, a snapshot of the plant's "version" is taken. If another user buys the last stock of that plant *before* the first consumer checks out, the backend safely catches the version mismatch (`409 Conflict`), prevents the sale, and the frontend automatically refreshes the cart to reflect the new state.

### 3. Redesigned Interface
- A complete visual overhaul using a dark-mode inspired "Green / Glassmorphism" aesthetic.
- New authentication pages (Login/Register) with role selectors.
- Role-based routing: you will automatically be redirected to the correct dashboard (`/shop` vs `/producer` vs `/owner`) based on your account type.
- Slide-out Cart Drawer for consumers.

---

## How to Run the Application

The application now consists of two parts that must run simultaneously: the Node backend and the Vite frontend.

### 1. Start the Backend Server
Open a terminal in the `e-plantShopping/server` directory and run:
```bash
npm run dev
```
*This will start the Express server on `http://localhost:5000`.*

### 2. Start the Frontend App
Open a *second* terminal in the main `e-plantShopping` directory and run:
```bash
npm run dev
```
*This will start the React app on `http://localhost:5173`.*

---

## 🔑 Login Details

**The Owner Account** has been seeded automatically using your `.env` variables.
- **Email:** `owner@eplant.com`
- **Password:** `Owner@1234`
- **Role:** Owner (👑)

To test the other roles, go to the **Register** page to create a Producer and a Consumer account!

> [!TIP]
> If you encounter any bugs, make sure your local MongoDB instance (`mongod`) is running on port `27017`!
