import { Router } from "express";
import { verifyToken } from "../utils/auth.middleware.js";

import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
} from "../controllers/user.controllers.js";

const router = Router();

router.get("/users", verifyToken, getUsers);
router.get("/users/:id", verifyToken, getUserById);
router.put("/users/:id", verifyToken, updateUser);
router.delete("/users/:id", verifyToken, deleteUser);
router.put("/users/:id/change-password", verifyToken, changePassword);

export default router;
