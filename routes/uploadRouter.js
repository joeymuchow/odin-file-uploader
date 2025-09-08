import { Router } from "express";
import { newUploadGet, newUploadPost } from "../controllers/uploadController.js";
import multer from "multer";

const upload = multer({ dest: "./public/uploads/" });

const uploadRouter = Router();

uploadRouter.get("/", newUploadGet);
uploadRouter.post("/", upload.single("file"), newUploadPost);

export default uploadRouter;