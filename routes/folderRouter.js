import { Router } from "express";
import { body } from "express-validator";
import { PrismaClient } from "../generated/prisma/index.js";
import {
  newFolderGet,
  newFolderPost,
  updateFolderNameGet,
  updateFolderNamePut,
  viewFolderGet,
} from "../controllers/folderController.js";

const folderRouter = Router();

async function checkFolderName(value, { req }) {
  const { user } = req;
  const prisma = new PrismaClient();
  const existingFolder = await prisma.folder
    .findFirst({
      where: { ownerId: user.id, name: value },
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
}

folderRouter.get("/new", newFolderGet);
folderRouter.post(
  "/new",
  body("folderName").custom(checkFolderName),
  newFolderPost
);
folderRouter.get("/:id", viewFolderGet);
folderRouter.get("/:id/update", updateFolderNameGet);
folderRouter.put(
  "/:id/update",
  body("newFolderName").custom(checkFolderName),
  updateFolderNamePut
);

export default folderRouter;
