import type * as configTypes from "../types/configTypes";
import type * as sqlTypes from "mssql";


/*
 * LOAD CONFIGURATION
 */


import config = require("../data/config");

Object.freeze(config);


/*
 * SET UP FALLBACK VALUES
 */


const configOverrides: { [propertyName: string]: any } = {};

const configFallbackValues = new Map<string, any>();

configFallbackValues.set("application.httpPort", 54099);

configFallbackValues.set("session.cookieName", "mini-shop-admin-user-sid");
configFallbackValues.set("session.secret", "cityssm/mini-shop-admin");
configFallbackValues.set("session.maxAgeMillis", 60 * 60 * 1000);
configFallbackValues.set("session.doKeepAlive", false);

configFallbackValues.set("products", {});

configFallbackValues.set("userPermissions", {});


export function getProperty(propertyName: "application.httpPort"): number;
export function getProperty(propertyName: "application.https"): configTypes.Config_HTTPSConfig;
export function getProperty(propertyName: "application.userDomain"): string;

export function getProperty(propertyName: "session.cookieName"): string;
export function getProperty(propertyName: "session.doKeepAlive"): boolean;
export function getProperty(propertyName: "session.maxAgeMillis"): number;
export function getProperty(propertyName: "session.secret"): string;

export function getProperty(propertyName: "activeDirectoryConfig"): configTypes.Config_ActiveDirectory;

export function getProperty(propertyName: "mssqlConfig"): sqlTypes.config;

export function getProperty(propertyName: "products"): { [productSKU: string]: configTypes.Config_Product };

export function getProperty(propertyName: "userPermissions"): { [userName: string]: string[] };


export function getProperty(propertyName: string): any {

  if (configOverrides.hasOwnProperty(propertyName)) {
    return configOverrides[propertyName];
  }

  const propertyNameSplit = propertyName.split(".");

  let currentObj = config;

  for (let index = 0; index < propertyNameSplit.length; index += 1) {

    currentObj = currentObj[propertyNameSplit[index]];

    if (!currentObj) {
      return configFallbackValues.get(propertyName);
    }

  }

  return currentObj;

}
