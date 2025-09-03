import { Router } from "express";
import { newUserGet, newUserPost } from "../controllers/userController.js";
import { body } from "express-validator";
import { PrismaClient } from "../generated/prisma";

const userRouter = Router();
const prisma = new PrismaClient();

userRouter.get("/", newUserGet);
userRouter.post(
  "/",
  body("username").custom(async (value) => {
    const existingUsername = await prisma.user
      .findUnique({
        where: { username: value },
      })
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
      });
    if (existingUsername.length) {
      throw new Error("This username is unavailable.");
    }
    return true;
  }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match.");
    }
    return true;
  }),
  newUserPost
);

export default userRouter;
