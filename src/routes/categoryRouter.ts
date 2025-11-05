import { Router } from "express";
import { listCategories } from "@controllers/categories";

const router = Router();

router.get("/", listCategories);

export default router;
