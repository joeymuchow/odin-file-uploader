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
      include: { files: true },
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
    });
  await prisma.$disconnect();
  if (folder) {
    res.render("folder", {
      name: folder.name,
      id: folder.id,
      files: folder.files,
    });
  } else {
    res.status(400).redirect("/");
  }
}

async function updateFolderNameGet(req, res) {
  const { id } = req.params;
  res.render("updateFolder", {
    url: `/folder/${id}/update`,
    back: `/folder/${id}`,
    message: "",
  });
}

async function updateFolderNamePut(req, res) {
  const { id } = req.params;
  const { newFolderName } = req.body;
  const result = validationResult(req);
  const prisma = new PrismaClient();

  if (!result.isEmpty()) {
    const formattedErrors = {};

    for (const error of result.array()) {
      formattedErrors[error.path] = error.msg;
    }

    res.status(400).render("updateFolder", {
      url: `/folder/${id}/update`,
      back: `/folder/${id}`,
      message: formattedErrors.newFolderName,
    });
  } else {
    try {
      await prisma.folder
        .update({
          where: { id: Number(id) },
          data: { name: newFolderName },
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

async function deleteFolderGet(req, res) {
  const { id } = req.params;
  const user = req.user;
  const prisma = new PrismaClient();
  const folder = await prisma.folder.findUnique({
    where: { id: Number(id) },
    include: { files: true },
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });

  if (folder.files.length) {
    const homeFolder = await prisma.folder.findFirst({
      where: { ownerId: user.id, name: "Home", }
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
    });
    for (const file of folder.files) {
      await prisma.file.update({
        where: { id: file.id },
        data: { folderId: homeFolder.id },
      })
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
      });
    }
  }
  
  await prisma.folder.delete({
    where: { id: Number(id) },
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
  await prisma.$disconnect();
  res.redirect("/");
}

export { newFolderGet, newFolderPost, viewFolderGet, updateFolderNameGet, updateFolderNamePut, deleteFolderGet };
