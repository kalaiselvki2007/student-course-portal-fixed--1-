# Student Course Registration Portal

Full-stack starter project using React (Vite), Express, and MongoDB.

## Requirements
- Node.js 20+
- MongoDB local installation OR MongoDB Atlas connection string

## 1. Backend
Open a terminal in VS Code:

```bash
cd server
npm install
```

Create `server/.env` using `.env.example` as a guide and set your MongoDB URI and JWT secret.

Seed sample courses:
```bash
npm run seed
```

Start backend:
```bash
npm run dev
```
Backend runs at http://localhost:5000

## 2. Frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually http://localhost:5173).

## Demo flow
1. Register a student account.
2. Log in.
3. Browse/search courses.
4. Enrol in a course.
5. Open My Courses and cancel enrolment.

## API routes
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/courses?search=&category=`
- POST `/api/enrolments`
- GET `/api/enrolments/me`
- DELETE `/api/enrolments/:id`

Passwords are hashed with bcrypt. JWT middleware protects enrolment routes.
