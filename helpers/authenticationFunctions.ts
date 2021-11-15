import * as configFunctions from "./configFunctions.js";


import ActiveDirectory from "activedirectory2";


const adConfig = configFunctions.getProperty("activeDirectoryConfig");
const userDomain = configFunctions.getProperty("application.userDomain");


export const authenticate = async (userName: string, password: string): Promise<boolean> => {

  return await new Promise((resolve, reject) => {

    const ad = new ActiveDirectory(adConfig);

    ad.authenticate(userDomain + "\\" + userName, password, (error, auth) => {

      if (error) {
        return reject(error);
      }

      return resolve(auth);
    });
  });
};
