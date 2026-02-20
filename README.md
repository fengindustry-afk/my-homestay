 # Indah Morib Homestay Website

A premium, modern homestay booking website built with **Next.js 15**, **React 19**, and **Tailwind CSS v4**.

## ✨ Features

- **Stunning UI**: Modern glassmorphism design with sleek animations and high-quality visuals.
- **Dynamic Search**: Functional search bar to filter rooms by type and guest capacity.
- **Booking System**: Integrated booking flow with a custom modal.
- **Payment Integration**: Ready-to-use **Billplz** (FPX/TNG) interface for secure payments.
- **Responsive**: Fully optimized for mobile, tablet, and desktop views.
- **SEO Ready**: Optimized metadata and semantic HTML structure.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Icons**: Lucide-inspired SVG components
- **Payments**: Billplz API

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory (one has been provided as `.env.local` for you):
   ```env
   BILLPLZ_API_KEY=your_api_key
   BILLPLZ_COLLECTION_ID=your_collection_id
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Visit [http://localhost:3000](http://localhost:3000) to see the result.

## 📂 Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components (Hero, Rooms, Navbar, etc.).
- `public/`: Static assets and icons.
- `globals.css`: Tailwind v4 theme and custom global styles.

## 💳 Payment Flow

The project currently uses a placeholder checkout API at `/api/checkout`. To enable real payments, ensure your Billplz credentials are correct and that your production URL is set as `NEXT_PUBLIC_BASE_URL`.

---

Built with ❤️ for Indah Morib Homestay.
