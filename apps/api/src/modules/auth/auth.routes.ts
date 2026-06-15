import { Router } from "express";
import { login, register } from "./auth.controller";
import { refresh } from "./auth.refresh.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { logout, logoutAll } from "./auth.logout.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);
router.post("/logout-all", requireAuth, logoutAll);


export default router;
