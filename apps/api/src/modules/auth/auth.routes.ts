import { Router } from "express";
import { login, register } from "./auth.controller";
import { refresh } from "./auth.refresh.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

export default router;
