import { Router } from "express";
import { login, register, me, updateProfile } from "./auth.controller";
import { refresh } from "./auth.refresh.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { logout, logoutAll } from "./auth.logout.controller";




const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);
router.post("/logout-all", requireAuth, logoutAll);
router.get("/me", requireAuth, me); 
router.patch("/me", requireAuth, updateProfile);


export default router;
