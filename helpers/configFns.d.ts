import type * as configTypes from "../types/configTypes";
import type * as sqlTypes from "mssql";
export declare function getProperty(propertyName: "application.httpPort"): number;
export declare function getProperty(propertyName: "application.https"): configTypes.Config_HTTPSConfig;
export declare function getProperty(propertyName: "application.userDomain"): string;
export declare function getProperty(propertyName: "session.cookieName"): string;
export declare function getProperty(propertyName: "session.doKeepAlive"): boolean;
export declare function getProperty(propertyName: "session.maxAgeMillis"): number;
export declare function getProperty(propertyName: "session.secret"): string;
export declare function getProperty(propertyName: "activeDirectoryConfig"): configTypes.Config_ActiveDirectory;
export declare function getProperty(propertyName: "mssqlConfig"): sqlTypes.config;
export declare function getProperty(propertyName: "products"): {
    [productSKU: string]: configTypes.Config_Product;
};
export declare function getProperty(propertyName: "userPermissions"): {
    [userName: string]: string[];
};
