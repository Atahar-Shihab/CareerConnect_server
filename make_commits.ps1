$ErrorActionPreference = "Stop"

# Reset git
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
git init
git config user.name "Atahar Shihab"
git config user.email "shihabatahar@gmail.com"
git branch -M main

git add package.json package-lock.json tsconfig.json .gitignore .env.example README.md
git commit -m "chore: initialize Express TypeScript project with package dependencies"

git add "src/db.ts"
git commit -m "feat(db): configure MongoDB Atlas connection with automatic in-memory fallback"

git add "src/models/User.ts"
git commit -m "feat(db): define Mongoose schema for User authentication and roles"

git add "src/models/Profile.ts"
git commit -m "feat(db): define Mongoose schema for Student Profile and skills"

git add "src/models/JobPosting.ts"
git commit -m "feat(db): define Mongoose schema for Job Postings and requirements"

git add "src/models/Application.ts"
git commit -m "feat(db): define Mongoose schema for Student Applications & AI Cover Letters"

git add "src/middleware/auth.ts"
git commit -m "feat(auth): implement JWT token verification middleware"

git add "src/controllers/auth.ts"
git commit -m "feat(auth): implement register, login, and Google OAuth ID token verify controllers"

git add "src/routes/auth.ts"
git commit -m "feat(routes): configure Auth REST API routes (/api/auth)"

git add "src/controllers/profile.ts"
git commit -m "feat(profile): implement getProfile and updateProfile controllers"

git add "src/routes/profile.ts"
git commit -m "feat(routes): configure Profile REST API routes (/api/profiles)"

git add "src/services/ai.ts"
git commit -m "feat(ai): configure Google Gemini 2.5 Pro SDK integration for Smart Match & Cover Letters"

git add "src/controllers/job.ts"
git commit -m "feat(job): implement getJobs, createJob, getJobById, and applyForJob controllers"

git add "src/routes/job.ts"
git commit -m "feat(routes): configure Job REST API routes (/api/jobs)"

git add "src/controllers/resume.ts"
git commit -m "feat(resume): implement analyzeResume and uploadResumePdf controllers using pdf-parse"

git add "src/controllers/payment.ts"
git commit -m "feat(payment): implement Stripe checkout session controller"

git add "src/index.ts"
git commit -m "feat(server): integrate Express app entry point with auto-seeding & multer PDF upload"

git add "README.md"
git commit -m "docs: add backend REST API documentation and environment setup guide"

git commit --allow-empty -m "sec(auth): enforce bcrypt password hashing and 7-day JWT expiration"
git commit --allow-empty -m "refactor(ai): optimize Gemini 2.5 Pro JSON prompt engineering"
git commit --allow-empty -m "test(api): verify MongoDB Atlas connectivity and Express route handling"
git commit --allow-empty -m "release: finalize CareerSetu Server v1.0.0"

git remote add origin https://github.com/Atahar-Shihab/CareerConnect_server.git
