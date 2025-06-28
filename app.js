import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import LocalStrategy from "passport-local";
import flash from "connect-flash";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import User from "./models/User.js";
import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

mongoose.connect(process.env.MONGO_URI);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", authRoutes);
app.use("/employees", employeeRoutes);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
