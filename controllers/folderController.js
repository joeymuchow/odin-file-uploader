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
      await prisma.folder
        .create({
          data: { name: folderName, ownerId: req.user.id },
        })
        .then(async () => {
          await prisma.$disconnect();
        })
        .catch(async (e) => {
          console.error(e);
          await prisma.$disconnect();
        });
      res.redirect("/");
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

async function viewFolderGet(req, res) {
  const { id } = req.params;
  const prisma = new PrismaClient();
  const folder = await prisma.folder
    .findUnique({
      where: { id: Number(id) },
      include: { files: true }
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
    });
  await prisma.$disconnect();
  if (folder) {
    res.render("folder", {
      name: folder.name,
      files: folder.files,
    });
  } else {
    res.status(400).redirect("/");
  }
}

export { newFolderGet, newFolderPost, viewFolderGet };
