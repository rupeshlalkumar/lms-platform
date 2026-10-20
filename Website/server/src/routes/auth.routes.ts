import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/protected", authenticateToken, (_req, res) => {
  res.json({
    success: true,
    message: "Authenticated request successful",
    user: res.locals.authUser,
  });
});

export default router;
