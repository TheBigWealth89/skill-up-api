# 🚀 SkillUp Nigeria – Vocational E-Learning Backend

![Node.js](https://img.shields.io/badge/Node.js-Backend-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen?logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-Token%20Store-critical?logo=redis)
![Auth](https://img.shields.io/badge/Auth-JWT%20+%20HTTPOnly%20Cookies-blue?logo=security)

SkillUp Nigeria is a **vocational e-learning platform** focused on helping Nigerian youth gain practical skills. This is the **secure and scalable Node.js backend** powering features like user registration, role-based access, course creation, assignments, and more.

### 🌐 Live API URL

📡 https://skill-up-api.onrender.com/

---

## 🔐 Features Overview

- ✅ JWT Authentication (Access + Refresh tokens)
- ✅ **Secure Token Rotation** with Redis (for blacklisting and reuse detection)
- ✅ **HTTP-only Cookies** for refresh token storage
- ✅ Role-Based Access Control (Admin, Instructor, Learner)
- ✅ Instructor course creation & assignment submission
- ✅ Learner course enrollment & assignment upload
- ✅ Admin approval of courses & user management
- ✅ Global error handling, and Redis-based access token token tracking

---

## 👥 User Roles and Permissions

| Role       | Permissions                                                     |
| ---------- | --------------------------------------------------------------- |
| Admin      | Approve courses, delete users, view dashboard analytics         |
| Instructor | Create courses, view their own courses, assign work to learners |
| Learner    | Enroll in courses, view enrolled courses, submit assignments    |

---

## 📁 API Endpoints Overview

### 🔑 Auth Routes

```
POST   /api/auth/signup          → Register user
POST   /api/auth/login           → Login with email/username & password
POST   /api/auth/logout          → Logout, blacklist token, clear cookie
POST   /api/auth/refresh         → Refresh access token (secure rotation)
POST   /api/auth/forgot-password → Send a rest password token
POST   /api/auth/forgot-password/token → Reset password
```

### 🎓 Courses

| Endpoint                                | Access             |
| --------------------------------------- | ------------------ |
| `GET /api/course/`                      | Public             |
| `POST /api/course/`                     | Admin + Instructor |
| `GET /api/course/instructor/my-courses` | Instructor Only    |
| `PATCH /api/course/:id/approve`         | Admin Only         |
| `DELETE /api/course/:id`                | Admin Only         |

### 📚 Enrollments

- `POST /api/enrollments/` → Learner enrollment
- `GET /api/enrollments/analytics` → Admin dashboard data

### 📩 Submissions

- `POST /api/submissions/` → Learner assignment upload
- `GET /api/submissions/:id` → Instructor reviews

---

## 🛡️ Authentication & Security

### JWT Token Flow:

- **Access Token:** Short-lived (15m), stored in Redis.
- **Refresh Token:** Long-lived (7d), stored in **HTTP-only cookies**.

### Token Security:

- Refresh tokens are stored in MongoDB (hashed) and validated on use.
- Redis is used for:
  - **Blacklisting access tokens** on logout
  - Enhancing overall token rotation security

---

## ⚙️ Tech Stack

- **Node.js** + **Express**
- **MongoDB** with Mongoose
- **Redis** (access & refresh token tracking)
- **Bcrypt** (password hashing)
- **JWT** (authentication)
- **Multer** (file uploads)
- **dotenv** (secure env config)
- **Resend API** (email resetPassword

---

## 📦 Project Setup

```bash
# Clone the project
git clone https://github.com/TheBigWealth89/skill-up-api.git
cd skill-up-api

# Install dependencies
npm install

# Add your environment variables
cp .env.example .env

# Start the server
npm start
npm run dev
```

---

## 📁 .env Configuration Example

```env
PORT=5000
MONGODB_URI=mongodb+srv://your-db
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_RESET_SECRET=your-reset-secret
REDIS_URL=redis://default:password@hostname:port
EMAIL_HOST=smtp.yourprovider.com

EMAIL_PORT=465
EMAIL_USER=your@email.com
EMAIL_PASS=your-password
EMAIL_FROM="<no-reply@youremail.com>"
BASE_URL=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

---

## 💡 Folder Structure (Simplified)

```
src/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── services/ (Redis, email)
├── server.js
```

---

## 🛠 Future Improvements

- ✅ Email verification
- ✅ Assignment grading & notifications
- ⏳ Real-time chat & feedback
- ⏳ Admin dashboard frontend and more..............

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss.

---

## 🧠 Author & Credits

Built with ❤️ by [Young Dev](https://github.com/TheBigWealth89?tab=repositories).  
Inspired by the SDG 4 & 8 goals for **education and employment empowerment**.
