# 📍 SNS Campus Navigator

Production-quality MVP for **SNS College of Engineering, Coimbatore, Tamil Nadu, India**.
Helps students quickly locate campus departments, calculate outdoor walking paths to building entrances using live GPS, and follow step-by-step indoor directions to specific classrooms.

---

## 🌟 Key Features

- **Outdoor GPS Positioning**: Browser Geolocation API locate-me button showing current student position on Leaflet map.
- **Interactive Campus Map**: Built with Leaflet & React-Leaflet with OpenStreetMap tiles, custom building markers, entrance endpoints, and approximate classroom visual pins.
- **Outdoor Walking Directions**: Server-side proxy to **OpenRouteService API** with Zod validation, displaying real-time walking distance (meters/km), estimated walking duration (minutes), and polyline route mapping.
- **Manual Indoor Directions**: Human-readable step-by-step instructions from building entrance to floor and room number with optional reference photos.
- **Department Search**: Live filter by department name, short name (e.g. `CSE`), building name, or room number (e.g. `Room 204`).
- **Protected Admin Panel**: Secure JWT authentication for campus administrators to add, edit, delete, activate/deactivate departments.
- **Interactive Leaflet Coordinate Picker**: Admin map tool allowing click-to-select for Building Location, Entrance Location, and Classroom visual pin without typing raw coordinates manually.
- **Database Seeding**: Built-in seed script initializing four default placeholder departments: Computer Science, ECE, EEE, and Mechanical Engineering.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 & custom Leaflet styles
- **Icons**: Lucide React
- **Mapping**: Leaflet & React-Leaflet (Client-only rendering)
- **Database**: MongoDB Atlas & Mongoose (cached connection pattern)
- **Validation**: Zod
- **Routing API**: OpenRouteService Directions API (`foot-walking`)
- **Authentication**: Custom JWT Cookie Auth (`jose` & `bcryptjs`)
- **Image Storage**: Cloudinary (optional fallback)

---

## 🚀 Getting Started & Installation

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed.

### 2. Clone Repository & Install Dependencies

```bash
git clone https://github.com/your-org/sns-campus-navigator.git
cd "SNS Routes"
npm install
```

---

## 🔑 Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/sns_campus_navigator?retryWrites=true&w=majority

# OpenRouteService API Key (Get a free key at https://openrouteservice.org/)
OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key

# OpenStreetMap Tile Server URL
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_APP_NAME="SNS Campus Navigator"

# Secret Key for Admin Authentication
AUTH_SECRET=sns_campus_navigator_secret_key_change_in_production_2026

# Cloudinary Configuration (Optional - for uploading instruction images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## ⚡ Local Development

Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌱 Database Seeding

To populate the database with the initial 4 placeholder departments (CSE, ECE, EEE, Mechanical Engineering):

- Option 1: Click the **Seed 4 Depts** button directly on the website navbar.
- Option 2: Send a POST request to `/api/departments/seed`:

```bash
curl -X POST http://localhost:3000/api/departments/seed
```

---

## 🛡️ Admin Dashboard Usage

1. Navigate to `/admin` or `/admin/login`.
2. Login with default admin credentials (or configured user):
   - **Username**: `admin`
   - **Password**: `admin123`
3. Click **Add Department** or **Edit** any existing department.
4. **Selecting Coordinates on Map**:
   - Click **Select Building Location** and click the campus map.
   - Click **Select Entrance Location** and click the entrance.
   - Click **Select Classroom Location** and click the room location.
5. **Adding Indoor Directions**:
   - Click **Add Step**, enter instruction text, and optionally upload a reference photo.
   - Re-order steps using up/down arrows.

---

## 📦 Production Build & Deployment

To test a production build locally:

```bash
npm run build
npm start
```

### Deploying to Vercel
1. Push code to GitHub.
2. Import project into Vercel.
3. Configure `MONGODB_URI`, `OPENROUTESERVICE_API_KEY`, and `AUTH_SECRET` under Vercel Project Environment Variables.
4. Deploy!

---

## 📄 License
MIT License. Developed for SNS College of Engineering, Coimbatore.
