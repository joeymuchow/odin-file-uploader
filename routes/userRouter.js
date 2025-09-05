import { Router } from "express";
import { newUserGet, newUserPost } from "../controllers/userController.js";
import { body } from "express-validator";
import { PrismaClient } from "../generated/prisma/index.js";

const userRouter = Router();
const prisma = new PrismaClient();

userRouter.get("/", newUserGet);
userRouter.post(
  "/",
  body("username").custom(async (value) => {
    const existingUsername = await prisma.userAccount
      .findUnique({
        where: { username: value },
      })
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
      });
      
    await prisma.$disconnect();
    if (existingUsername) {
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
