import createError from "http-errors";
import express from "express";
import compression from "compression";
import path from "path";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import rateLimit from "express-rate-limit";
import session from "express-session";
import sqlite from "connect-sqlite3";
import * as miniShopDB from "@cityssm/mini-shop-db";
import * as configFunctions from "./helpers/configFunctions.js";
import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import routerLogin from "./routes/login.js";
import routerOrders from "./routes/orders.js";
import Debug from "debug";
const debugApp = Debug("mini-shop-admin:app");
const __dirname = ".";
miniShopDB.setConfig({
    mssqlConfig: configFunctions.getProperty("mssqlConfig")
});
export const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(compression());
app.use((request, _response, next) => {
    debugApp(request.method + " " + request.url);
    next();
});
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(csurf({ cookie: true }));
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000
});
app.use(limiter);
app.use(express.static(path.join(__dirname, "public")));
app.use("/lib/bulma-webapp-js", express.static(path.join(__dirname, "node_modules", "@cityssm", "bulma-webapp-js", "dist")));
app.use("/lib/fa5", express.static(path.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")));
const SQLiteStore = sqlite(session);
const sessionCookieName = configFunctions.getProperty("session.cookieName");
app.use(session({
    store: new SQLiteStore({
        dir: "data",
        db: "sessions.db"
    }),
    name: sessionCookieName,
    secret: configFunctions.getProperty("session.secret"),
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: configFunctions.getProperty("session.maxAgeMillis"),
        sameSite: "strict"
    }
}));
app.use((request, response, next) => {
    if (request.cookies[sessionCookieName] && !request.session.user) {
        response.clearCookie(sessionCookieName);
    }
    next();
});
const sessionChecker = (request, response, next) => {
    if (request.session.user && request.cookies[sessionCookieName]) {
        return next();
    }
    return response.redirect("/login");
};
app.use(function (request, response, next) {
    response.locals.configFns = configFunctions;
    response.locals.dateTimeFns = dateTimeFns;
    response.locals.stringFns = stringFns;
    response.locals.user = request.session.user;
    response.locals.csrfToken = request.csrfToken();
    next();
});
app.get("/", sessionChecker, (_request, response) => {
    response.redirect("/orders");
});
app.use("/orders", sessionChecker, routerOrders);
app.use("/login", routerLogin);
app.get("/logout", (request, response) => {
    if (request.session.user && request.cookies[sessionCookieName]) {
        request.session.destroy(null);
        request.session = undefined;
        response.clearCookie(sessionCookieName);
    }
    response.redirect("/login");
});
app.use(function (_request, _response, next) {
    next(createError(404));
});
app.use((error, request, response) => {
    response.locals.message = error.message;
    response.locals.error = request.app.get("env") === "development" ? error : {};
    response.status(error.status || 500);
    response.render("error");
});
export default app;
