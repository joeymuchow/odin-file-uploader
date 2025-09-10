import { Router } from "express";
import { body } from "express-validator";
import { PrismaClient } from "../generated/prisma/index.js";
import { newFolderGet, newFolderPost, viewFolderGet } from "../controllers/folderController.js";

const folderRouter = Router();

folderRouter.get("/new", newFolderGet);
folderRouter.post(
  "/new",
  body("folderName").custom(async (value, { req }) => {
    const { user } = req;
    const prisma = new PrismaClient();
    const existingFolder = await prisma.folder
      .findFirst({
        where: { id: user.id, name: value },
      })
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
      });

    await prisma.$disconnect();

    if (existingFolder) {
      throw new Error("This folder name already exists.");
    }

    return true;
  }),
  newFolderPost
);
folderRouter.get("/:id", viewFolderGet);

export default folderRouter;
