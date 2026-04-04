import express from "express";
import { signup, login, logout, getMe } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectroute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe); // protected

export default router;
// ```

// ---

// ## Step 6 — Test with Postman / Thunder Client

// Test these endpoints:

// **Signup**
// ```
// POST http://localhost:5000/api/auth/signup
// Body (JSON):
// {
//   "fullName": "Test User",
//   "email": "test@gmail.com",
//   "password": "123456"
// }
// ```

// **Login**
// ```
// POST http://localhost:5000/api/auth/login
// Body (JSON):
// {
//   "email": "test@gmail.com",
//   "password": "123456"
// }