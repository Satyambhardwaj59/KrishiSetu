# KrishiSetu - Final Integration & Deployment Guide

This document details the final steps to connect the KrishiSetu ecosystem, setup environment variables, and deploy to production servers.

> **Note:** The backend operates on **Node.js/Express**, while both the **Main Interface** and **Admin Panel** utilize **Next.js**. You will deploy the applications on Render (Backend) and Vercel (Frontends).

---

## 1. Local Ecosystem Integration & Test Flow

To test the complete KrishiSetu system locally, run the servers in three separate terminal instances.

1. **Backend**: `cd backend && npm run dev` (Starts at http://localhost:5000)
2. **Frontend**: `cd frontend && npm run dev` (Starts at http://localhost:3000)
3. **Admin**: `cd admin && npm run dev` (Starts at http://localhost:3001)

### Integration Test Checklist
- [x] **Add Product**: Login as Farmer → Complete KYC (Admin portal verify) → Add Product via Cloudinary integration.
- [x] **Order Creation**: Login as Buyer → Browse Marketplace → Place bulk order.
- [x] **Razorpay Flow**: Go to Orders as Buyer → Complete Payment → Verify Razorpay Signature → Escrow status held.
- [x] **Real-Time Websockets**: Farmer receives "Payment Success" & "New Order" notification instantly.
- [x] **Communication**: Buyer and Farmer exchange real-time messages via the dedicated `chat.socket.js` rooms.
- [x] **Dispute Resolution**: If needed, Admin intercepts the order via Admin portal and overrides the Escrow status.

---

## 2. Environment Variables

Before deploying, ensure you configure the following keys in your environments across the respective services.

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/krishisetu?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=super_secure_access_secret_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=super_secure_refresh_secret_key

# Integrations
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=rzp_live_your_secret

# Twilio (Optional, we used Mock for development)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

### Main Frontend (`frontend/.env.local`)
```env
# Backend Base Routes
NEXT_PUBLIC_API_URL=https://krishisetu-api.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://krishisetu-api.onrender.com

# Cloudinary Direct Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=krishisetu_frontend
```

### Admin Panel (`admin/.env.local`)
```env
# Point to the same backend API as the frontend
NEXT_PUBLIC_API_URL=https://krishisetu-api.onrender.com/api
```

> **Warning:** Never expose secrets such as `RAZORPAY_KEY_SECRET` or `JWT_SECRET` in Next.js environment files without a backend proxy. Use `NEXT_PUBLIC_` only for explicitly public keys.

---

## 3. Deployment Steps

### Step 1: Database (MongoDB Atlas)
1. Navigate to **MongoDB Atlas**.
2. Create a new Serverless or Dedicated cluster.
3. Whitelist IP addresses: Allow Access from Anywhere (`0.0.0.0/0`) since the backend IP may rotate in PaaS deployments.
4. Retrieve the `MONGO_URI` connection string for the Render backend.

### Step 2: Backend Deployment (Render or AWS EC2)
**Using Render.com (Recommended for Easy Setup):**
1. Connect your Github/Gitlab repository.
2. Create a new **Web Service**.
3. Select your `backend` directory as the Root Directory.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Click **Advanced -> Environment Variables** and inject the entire backend `.env` variables list.
7. Deploy. The backend will now supply API data and Socket connections globally.

### Step 3: Frontend Deployment (Vercel)
1. Push your repository to Github.
2. Sign into **Vercel** and click **Add New Project**.
3. Locate your repository and map the root directory to `frontend`.
4. Framework Preset: **Next.js**.
5. Add the environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SOCKET_URL`
   *(Make sure they point to your newly deployed Render API url).*
6. Hit **Deploy**.

### Step 4: Admin Deployment (Vercel)
1. Within **Vercel**, create another new project choosing the exact same repository.
2. This time, map the Root Directory to `admin`.
3. Add the `NEXT_PUBLIC_API_URL` variable.
4. Hit **Deploy**.

> **Important:** Once all 3 links are live, go to **Razorpay Dashboard -> Settings -> Webhooks** and add your backend's Vercel/Render URL (`https://krishisetu-api.onrender.com/api/payments/webhook`) to automate asynchronous server-side payment verification.
