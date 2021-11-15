import { Router } from "express";
import * as authFunctions from "../helpers/authenticationFunctions.js";
import * as configFunctions from "../helpers/configFunctions.js";
const redirectURL = "/orders";
export const router = Router();
router.route("/")
    .get((request, response) => {
    const sessionCookieName = configFunctions.getProperty("session.cookieName");
    if (request.session.user && request.cookies[sessionCookieName]) {
        response.redirect(redirectURL);
    }
    else {
        response.render("login", {
            userName: "",
            message: ""
        });
    }
})
    .post(async (request, response) => {
    const userName = request.body.userName;
    const passwordPlain = request.body.password;
    try {
        const isAuthenticated = await authFunctions.authenticate(userName, passwordPlain);
        if (isAuthenticated) {
            const productSKUs = configFunctions.getProperty("userPermissions")[userName];
            if (productSKUs) {
                request.session.user = {
                    userName,
                    productSKUs
                };
                return response.redirect(redirectURL);
            }
            else {
                return response.render("login", {
                    userName,
                    message: "Access Denied"
                });
            }
        }
        return response.render("login", {
            userName,
            message: "Login Failed"
        });
    }
    catch (_a) {
        return response.render("login", {
            userName,
            message: "Login Failed"
        });
    }
});
export default router;
