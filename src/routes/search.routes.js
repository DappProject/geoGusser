import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { SearchGeoGuesser } from "../controllers/search.controller.js";

const router = Router();

router.route("/search").post(upload.single('file'), SearchGeoGuesser)

export default router