import type * as sqlTypes from "mssql";

export interface Config {

  application?: {
    httpPort?: number;
    https?: Config_HTTPSConfig;
    userDomain?: string;
  };

  session?: {
    cookieName?: string;
    secret?: string;
    maxAgeMillis?: number;
    doKeepAlive?: boolean;
  };

  mssqlConfig: sqlTypes.config;

  activeDirectoryConfig: Config_ActiveDirectory;

  userPermissions: {
    [userName: string]: string[];
  };
}

export interface Config_HTTPSConfig {
  port: number;
  keyPath: string;
  certPath: string;
  passphrase?: string;
}

export interface Config_ActiveDirectory {
  url: string;
  baseDN: string;
  username: string;
  password: string;
}
