"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    .post((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = req.body.userName;
    const passwordPlain = req.body.password;
    try {
        const isAuthenticated = yield authFns.authenticate(userName, passwordPlain);
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
}));
module.exports = router;
