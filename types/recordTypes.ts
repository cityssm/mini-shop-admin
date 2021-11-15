export interface User {
  userName: string;
  productSKUs: string[];
}


declare module "express-session" {
  interface Session {
    user: User;
  }
}
