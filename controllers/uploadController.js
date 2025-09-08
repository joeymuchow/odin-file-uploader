import { PrismaClient } from "../generated/prisma/index.js";

function newUploadGet(req, res) {
  res.render("upload", {});
}

async function newUploadPost(req, res) {
  console.log(req.file);
  // TODO: Upload file to cloud storage
  // TODO: Store link to file in DB along with other info like folder
  res.redirect("/");
}

export { newUploadGet, newUploadPost }