import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/index.js";

function newUserGet(req, res) {
  res.render("signUp", {
    url: "/sign-up",
    username: "",
    errors: null,
  });
}

async function newUserPost(req, res, next) {
  const { username, password } = req.body;
  const result = validationResult(req);
  const prisma = new PrismaClient();

  if (!result.isEmpty()) {
    const formattedErrors = {};

    for (const error of result.array()) {
      formattedErrors[error.path] = error.msg;
    }

    res.status(400).render("signUp", {
      url: "/sign-up",
      username: username,
      errors: formattedErrors,
    });
  } else {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.userAccount.create({
        data: { username: username, password: hashedPassword },
      }).then(async (user) => {
        await prisma.folder.create({
          data: { name: "Home", ownerId: user.id }
        });
      });
      await prisma.$disconnect();
      res.redirect("/");
    } catch (error) {
      console.error(error);
      await prisma.$disconnect();
      next(error);
    }
  }
}

export { newUserGet, newUserPost };
