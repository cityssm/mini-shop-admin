"use strict";
const createError = require("http-errors");
const express = require("express");
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const sqlite = require("connect-sqlite3");
const miniShopDB = require("@cityssm/mini-shop-db/config");
const configFns = require("./helpers/configFns");
const stringFns = require("@cityssm/expressjs-server-js/stringFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const routerLogin = require("./routes/login");
const routerOrders = require("./routes/orders");
miniShopDB.setMSSQLConfig(configFns.getProperty("mssqlConfig"));
const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(compression());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/lib/bulma-webapp-js", express.static(path.join(__dirname, "node_modules", "@cityssm", "bulma-webapp-js", "dist")));
app.use("/lib/fa5", express.static(path.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")));
const SQLiteStore = sqlite(session);
const sessionCookieName = configFns.getProperty("session.cookieName");
app.use(session({
    store: new SQLiteStore({
        dir: "data",
        db: "sessions.db"
    }),
    name: sessionCookieName,
    secret: configFns.getProperty("session.secret"),
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: configFns.getProperty("session.maxAgeMillis"),
        sameSite: "strict"
    }
}));
app.use((req, res, next) => {
    if (req.cookies[sessionCookieName] && !req.session.user) {
        res.clearCookie(sessionCookieName);
    }
    next();
});
const sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies[sessionCookieName]) {
        return next();
    }
    return res.redirect("/login");
};
app.use(function (req, res, next) {
    res.locals.configFns = configFns;
    res.locals.dateTimeFns = dateTimeFns;
    res.locals.stringFns = stringFns;
    res.locals.user = req.session.user;
    res.locals.pageTitle = "";
    next();
});
app.get("/", sessionChecker, (_req, res) => {
    res.redirect("/orders");
});
app.use("/orders", sessionChecker, routerOrders);
app.use("/login", routerLogin);
app.get("/logout", (req, res) => {
    if (req.session.user && req.cookies[sessionCookieName]) {
        req.session.destroy(null);
        req.session = null;
        res.clearCookie(sessionCookieName);
    }
    res.redirect("/login");
});
app.use(function (_req, _res, next) {
    next(createError(404));
});
app.use(function (err, req, res, _next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});
module.exports = app;
