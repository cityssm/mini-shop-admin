import config from "../data/config.js";
const configOverrides = {};
const configFallbackValues = new Map();
configFallbackValues.set("application.httpPort", 54099);
configFallbackValues.set("session.cookieName", "mini-shop-admin-user-sid");
configFallbackValues.set("session.secret", "cityssm/mini-shop-admin");
configFallbackValues.set("session.maxAgeMillis", 60 * 60 * 1000);
configFallbackValues.set("session.doKeepAlive", false);
configFallbackValues.set("products", {});
configFallbackValues.set("userPermissions", {});
export function getProperty(propertyName) {
    if (Object.prototype.hasOwnProperty.call(configOverrides, propertyName)) {
        return configOverrides[propertyName];
    }
    const propertyNameSplit = propertyName.split(".");
    let currentObject = config;
    for (const element of propertyNameSplit) {
        currentObject = currentObject[element];
        if (!currentObject) {
            return configFallbackValues.get(propertyName);
        }
    }
    return currentObject;
}
