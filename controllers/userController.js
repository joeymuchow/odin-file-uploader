import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

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
      await prisma.user.create({username, password: hashedPassword});
      res.redirect("/");
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
  
}


export {
  newUserGet,
  newUserPost,
}