import { PrismaClient } from "../generated/prisma/index.js";

function newUploadGet(req, res) {
  const { user } = req;
  res.render("upload", {
    folders: user.folders,
  });
}

async function newUploadPost(req, res) {
  console.log(req.file);
  // TODO: Upload file to cloud storage
  // TODO: Store link to file in DB along with other info like folder
  const prisma = new PrismaClient();
  try {
    const { name, folder } = req.body;
    const { user, file } = req;
    // This fileURL will need to be changed when cloud storage for files is implemented
    const fileURL = file.path;
    const folderData = await prisma.folder.findFirst({
      where: { name: folder, ownerId: user.id },
    });
    await prisma.file.create({
      data: { name, fileURL, size: file.size, folderId: folderData.id },
    });
    await prisma.$disconnect();
    res.redirect("/");
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    res.status(400).redirect("/");
  }
}

export { newUploadGet, newUploadPost };
