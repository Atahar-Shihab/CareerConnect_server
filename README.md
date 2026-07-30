# ⚙️ CareerConnect Server — Express & Node.js Backend Engine

<p align="center">
  <a href="https://careerconnect-server-1.onrender.com" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_API-Render-green?style=for-the-badge&logo=render" alt="Live API" />
  </a>
  <img src="https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-v5-black?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB_Atlas-Mongoose-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google_Gemini_SDK-v2.5-8E75B2?style=for-the-badge&logo=google" alt="Google Gemini" />
</p>

> **CareerConnect RESTful API Core**  
> Powers JWT & Google OAuth ID token verification, MongoDB Atlas cluster persistence, automated in-memory MongoDB fallback, Multer + `pdf-parse` resume processing, Stripe checkout session management, and Google Gemini 2.5 Pro AI workflows.

---

## 🔗 Live Production Endpoints

- 🌐 **Primary API URL**: [https://careerconnect-server-1.onrender.com](https://careerconnect-server-1.onrender.com)
- 💻 **Client Repository**: [https://github.com/Atahar-Shihab/CareerConnect_client](https://github.com/Atahar-Shihab/CareerConnect_client)
- ⚙️ **Server Repository**: [https://github.com/Atahar-Shihab/CareerConnect_server](https://github.com/Atahar-Shihab/CareerConnect_server)

---

## 📡 REST API Endpoint Documentation

### 🔐 1. Authentication Routes (`/api/auth`)
- `POST /api/auth/register` — Register a new student or employer account with bcrypt password hashing.
- `POST /api/auth/login` — Authenticate user credentials and return 7-day JWT.
- `POST /api/auth/google` — Authenticate or auto-register using verified Google OAuth ID Token (`google-auth-library`).
- `GET /api/auth/me` — Retrieve logged-in user details.

### 👤 2. Profile Routes (`/api/profiles`)
- `GET /api/profiles` — Retrieve student bio, skills array, and resume links.
- `PUT /api/profiles` — Update student bio, technical skill tags, and portfolio links.

### 💼 3. Job & Application Routes (`/api/jobs`)
- `GET /api/jobs` — Retrieve active campus job postings.
- `GET /api/jobs/:id` — Retrieve job posting details + instant Gemini AI Smart Match score.
- `POST /api/jobs` — Publish a new campus job opportunity (Employer account required).
- `POST /api/jobs/:id/apply` — Apply for a campus job & auto-generate 1-click Gemini AI Cover Letter.
- `GET /api/jobs/my-applications` — Retrieve all submitted job applications for the logged-in student.
- `GET /api/jobs/employer/my-jobs` — Retrieve all posted jobs and candidate applicants for the logged-in employer.

### 📄 4. Resume AI Routes (`/api/resume`)
- `POST /api/resume/analyze` — Analyze raw resume text for keyword feedback & readiness score.
- `POST /api/resume/upload` — Upload `.pdf` resume file via `multer`, parse text with `pdf-parse`, extract skills, and auto-update student profile with Gemini AI.

### 💳 5. Payment Routes (`/api/payments`)
- `POST /api/payments/create-checkout-session` — Create Stripe Checkout session for Featured Job Postings ($10 USD) or Student Pro Badges ($5 USD).

---

## 🔐 Environment Configuration (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.ljntbv0.mongodb.net/careersetu?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
STRIPE_SECRET_KEY=your_stripe_secret_key
```

---

## 🚀 Running Locally

```bash
# Clone repository
git clone https://github.com/Atahar-Shihab/CareerConnect_server.git
cd CareerConnect_server

# Install dependencies
npm install

# Run in Development Mode
npm run dev

# Build for Production (tsc)
npm run build

# Start Production Server
npm start
```

---

## 👤 Author & Contribution

Developed with ❤️ by **Atahar Shihab**.
- 📧 Email: `shihabatahar@gmail.com`
- 🌐 Portfolio: [https://atahar-shihab-portfolio.vercel.app](https://atahar-shihab-portfolio.vercel.app)
- 🐙 GitHub Profile: [https://github.com/Atahar-Shihab](https://github.com/Atahar-Shihab)
