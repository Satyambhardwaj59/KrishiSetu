# KrishiSetu - Developer Workflow & Quick Start Guide

Welcome to the **KrishiSetu** monorepo! This application is separated into three distinct services:
1. **`backend/`** (Node.js, Express, MongoDB, Socket.io)
2. **`frontend/`** (Next.js, Redux Toolkit, TailwindCSS - for Farmers & Buyers)
3. **`admin/`** (Next.js, TailwindCSS, Recharts - for Platform Admins)

---

## 🌟 Features Overview

### 1. Dual-Application Portals
* **Farmer & Buyer Portal**: Next.js & Redux Toolkit UI for crop listing, profile management, marketplace browsing, and bulk purchasing.
* **Admin Control Center**: Built-in KYC validation, interactive charts, and system overrides for dispute management.

### 2. Weather Intelligence & Crop Advisory
* **Forecasting**: Connects to the **Open-Meteo API** using `axios` to fetch current, 24-hour, and 7-day weather indicators based on user coordinates.
* **Advisory Engine**: Generates crop recommendations (watering, harvesting alerts) depending on precipitation, temperature, and wind speed parameters.
* **Automated Weather Alerts**: Uses `node-cron` to scan forecasts every 12 hours and broadcast real-time `weather_alert` events via `Socket.io` to warn users of severe weather.

### 3. Escrow Payments & Secure Transactions
* **Razorpay Flow**: Seamless payment processing with cryptographic signature verification.
* **Escrow Management**: Holds buyer funds safely in escrow until order delivery, with admin override capabilities.

### 4. Real-Time Communication
* **Instant Messaging**: Custom room support (`chat.socket.js`) powered by `Socket.io` for negotiations between buyers and farmers.
* **Live Notifications**: Immediate order, payment, and weather alert notifications.

---

## 🛠️ Technology Stack & Dependencies

### Backend (`backend/`)
* **Framework**: Express, Node.js
* **Database**: MongoDB (Mongoose ODM)
* **Auth**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
* **Real-time & Cron**: `socket.io`, `node-cron`
* **Validations & Security**: `joi`, `express-rate-limit`, `helmet`
* **Media & Payments**: `cloudinary`, `multer`, `multer-storage-cloudinary`, `razorpay`

### Frontend & Admin (`frontend/` & `admin/`)
* **Framework**: Next.js (React 19)
* **Styling**: Tailwind CSS & `@tailwindcss/postcss`
* **State Management**: Redux Toolkit & React Redux (in `frontend/`)
* **Charts**: Recharts
* **Networking & Socket**: `axios`, `socket.io-client`
* **Alerts & Icons**: `react-hot-toast`, `lucide-react`, `react-icons`

---

## 🚀 How to Start the Project Locally

Follow these steps to spin up the entire ecosystem on your local machine:

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Local instance or an Atlas URI)
- Optional: Cloudinary & Razorpay test keys for full feature parity.

### 2. Setup the Backend
1. Open a terminal and navigate to the backend:
   ```bash
   cd backend
   npm install
   ```
2. Copy the environment template and modify the keys:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `MONGO_URI` is pointing to your active MongoDB instance and add dummy values for JWT endpoints if testing without real keys).*
3. Start the server:
   ```bash
   npm run dev
   ```
   *The API will be available at `http://localhost:5000`*.

### 3. Setup the Main Frontend
1. Open a **new** terminal tab:
   ```bash
   cd frontend
   npm install
   ```
2. Set up the local `.env.local` file (create it if missing):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The Farmer/Buyer portal will be available at `http://localhost:3000`*.

### 4. Setup the Admin Panel
1. Open a **third** terminal tab:
   ```bash
   cd admin
   npm install
   ```
2. Set up the local `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
3. Start the development server (runs on a different port automatically unless specified):
   ```bash
   npm run dev -- -p 3001
   ```
   *The Admin portal will be available at `http://localhost:3001`*.

---

## 🔄 Daily Development Workflow

When contributing to KrishiSetu, follow this standardized flow:

### Layer 1: Adding a New Backend Feature
1. **Define the Model (`backend/models/`)**: Create or update Mongoose schemas.
2. **Build the Controller (`backend/controllers/`)**: Implement business logic and data aggregation. Ensure you use `apiResponse.js` custom wrapper for standardized JSON return values.
3. **Add Validation (`backend/validators/`)**: Define strict Joi schemas to validate incoming `req.body`.
4. **Register the Route (`backend/routes/`)**: Map the HTTP method to your controller and add necessary middlewares (e.g., `protect`, `restrictTo('admin')`).

### Layer 2: Connecting the Frontend
1. **Update API/Redux (`frontend/src/store/slices/`)**: 
   - Add a new `createAsyncThunk` pointing to your new backend endpoint.
   - Update the slice `reducers`/`extraReducers` to handle loading, success, and error states.
2. **Build the UI Components (`frontend/src/components/ui/`)**: Create highly reusable, self-contained aesthetic components. Use Tailwind for styling and do not hardcode specific business logic inside them.
3. **Draft the Page (`frontend/src/app/`)**: Assemble your features inside the `app/` directory and use standard React Hooks `useDispatch` and `useSelector` to dispatch thunks.

### Layer 3: Handling Real-Time (Socket.io)
If your feature requires real-time capabilities (like notifications or chat):
1. Add the emit logic cleanly inside the **backend controllers** or the `backend/sockets/` dispatchers.
2. Listen to the event using the singleton hook defined in `frontend/src/lib/socket.js`. Use `useEffect` block inside your target frontend page to listen to the event and dispatch Redux state changes dynamically without page reloads.

---

## 🧪 Testing User Roles Locally

Since this is a multi-role platform, here is how you simulate interactions without real OTPs:

1. **Simulating a Farmer**: 
   - Go to `http://localhost:3000/login`
   - Use phone: `9876543210`
   - The UI will flash a Mock OTP. Input the mock OTP.
   - You will land on the Farmer Dashboard. Add a product.

2. **Simulating an Admin**:
   - Go to `http://localhost:3001/login`
   - Use phone: `9999999990`
   - Login with the OTP. You are now inside the master platform override.
   - Go to the **Users** tab and **Verify** the KYC status of the Farmer you just created so their items become active.

3. **Simulating a Buyer**:
   - Go to `http://localhost:3000/login`
   - Use phone: `1234567890`
   - Go to Marketplace, find the Farmer's product, place an order, and watch the notifications populate!
