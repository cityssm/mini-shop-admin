"use strict";
const express_1 = require("express");
const authFns = require("../helpers/authFns");
const configFns = require("../helpers/configFns");
const redirectURL = "/orders";
const router = express_1.Router();
router.route("/")
    .get((req, res) => {
    const sessionCookieName = configFns.getProperty("session.cookieName");
    if (req.session.user && req.cookies[sessionCookieName]) {
        res.redirect(redirectURL);
    }
    else {
        res.render("login", {
            userName: "",
            message: ""
        });
    }
})
    .post(async (req, res) => {
    const userName = req.body.userName;
    const passwordPlain = req.body.password;
    try {
        const isAuthenticated = await authFns.authenticate(userName, passwordPlain);
        if (isAuthenticated) {
            const productSKUs = configFns.getProperty("userPermissions")[userName];
            if (productSKUs) {
                req.session.user = {
                    userName,
                    productSKUs
                };
                return res.redirect(redirectURL);
            }
            else {
                return res.render("login", {
                    userName,
                    message: "Access Denied"
                });
            }
        }
        return res.render("login", {
            userName,
            message: "Login Failed"
        });
    }
    catch (_e) {
        return res.render("login", {
            userName,
            message: "Login Failed"
        });
    }
});
module.exports = router;
