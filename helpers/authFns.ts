import * as configFns from "./configFns";


import ActiveDirectory = require("activedirectory2");


const adConfig = configFns.getProperty("activeDirectoryConfig");
const userDomain = configFns.getProperty("application.userDomain");


export const authenticate = async (userName: string, password: string): Promise<boolean> => {

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
