# ⚙️ CareerConnect Server — Backend API Engine

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-v5-black?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB_Atlas-Mongoose-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google_Gemini_SDK-v2.5-8E75B2?style=for-the-badge&logo=google" alt="Google Gemini" />
</p>

> **CareerConnect RESTful Backend API**  
> Powers user authentication (JWT + Google OAuth token verification), MongoDB Atlas database persistence, automated in-memory MongoDB fallback, PDF resume text parsing, and Google Gemini 2.5 Pro AI workflows.

---

## 🔑 Environment Setup (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.ljntbv0.mongodb.net/careersetu?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📡 REST API Endpoints

### 🔐 Auth Routes (`/api/auth`)
- `POST /api/auth/register` — Register a new student or employer account.
- `POST /api/auth/login` — Authenticate user and receive JWT.
- `POST /api/auth/google` — Authenticate or auto-register using verified Google OAuth ID Token.
- `GET /api/auth/me` — Get current logged-in user profile.

### 👤 Profile Routes (`/api/profiles`)
- `GET /api/profiles` — Fetch student profile & skills array.
- `PUT /api/profiles` — Update student bio, skills, and portfolio links.

### 💼 Job Routes (`/api/jobs`)
- `GET /api/jobs` — Retrieve active campus job postings.
- `GET /api/jobs/:id` — Retrieve job posting details + Gemini AI Smart Match score.
- `POST /api/jobs` — Post a new job opportunity (Employer/User).
- `POST /api/jobs/:id/apply` — Apply for a job & generate 1-click Gemini AI Cover Letter.

### 📄 Resume AI Routes (`/api/resume`)
- `POST /api/resume/analyze` — Analyze raw resume text for keyword feedback & readiness.
- `POST /api/resume/upload` — Upload `.pdf` resume file via `multer`, extract text with `pdf-parse`, and auto-update student skills with Gemini AI.

---

## 🚀 Running Server Locally

```bash
# Clone repository
git clone https://github.com/Atahar-Shihab/CareerConnect_server.git
cd CareerConnect_server

# Install dependencies
npm install

# Run in dev mode (ts-node-dev auto reload)
npm run dev
```

---

## 👤 Author
Developed with ❤️ by **Atahar Shihab**.
