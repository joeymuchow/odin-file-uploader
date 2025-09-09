import { validationResult } from "express-validator";
import { PrismaClient } from "../generated/prisma/index.js";

function newFolderGet(req, res) {
  res.render("newFolder", {
    url: "/folder/new",
    folderName: "",
    message: "",
  });
}

async function newFolderPost(req, res) {
  const { folderName } = req.body;
  const result = validationResult(req);
  const prisma = new PrismaClient();

  if (!result.isEmpty()) {
      const formattedErrors = {};
  
      for (const error of result.array()) {
        formattedErrors[error.path] = error.msg;
      }
  
      res.status(400).render("newFolder", {
        url: "/folder/new",
        folderName: "",
        message: formattedErrors.folderName,
      });
    } else {
      try {
        await prisma.folder.create({
          data: { name: folderName, ownerId: req.user.id },
        });
        res.redirect("/");
      } catch (error) {
        console.error(error);
        next(error);
      }
    }
}

export { newFolderGet, newFolderPost }