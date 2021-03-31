"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const configFns = require("./configFns");
const ActiveDirectory = require("activedirectory2");
const adConfig = configFns.getProperty("activeDirectoryConfig");
const userDomain = configFns.getProperty("application.userDomain");
const authenticate = async (userName, password) => {
    return await new Promise((resolve, reject) => {
        const ad = new ActiveDirectory(adConfig);
        ad.authenticate(userDomain + "\\" + userName, password, (err, auth) => {
            if (err) {
                return reject(err);
            }
            return resolve(auth);
        });
    });
};
exports.authenticate = authenticate;
