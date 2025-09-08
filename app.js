import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "./generated/prisma/index.js";
import userRouter from "./routes/userRouter.js";
import flash from "connect-flash";
import uploadRouter from "./routes/uploadRouter.js";

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const __dirname = import.meta.dirname;
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded());

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(flash());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const prisma = new PrismaClient();
      const user = await prisma.userAccount.findUnique({
        where: { username },
      });

      await prisma.$disconnect();

      if (!user) {
        return done(null, false, { message: "Log in failed" });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Log in failed" });
      }

      return done(null, user);
    } catch (err) {
      await prisma.$disconnect();
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const prisma = new PrismaClient();
    const user = await prisma.userAccount.findFirst({
      where: { id },
    });

    await prisma.$disconnect();
    done(null, user);
  } catch (err) {
    await prisma.$disconnect();
    done(err);
  }
});

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.use("/sign-up", userRouter);
app.use("/upload", uploadRouter);

// authentication
app.get("/log-in", (req, res) => {
  const errorMessage = req.flash("error");
  res.render("login", {
    message: errorMessage,
  });
});
app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureFlash: true,
  })
);
app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.use("/", (req, res) => {
  res.send("Not found");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));
