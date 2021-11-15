import path from "path";
import type { ServiceConfig } from "node-windows";

const __dirname = ".";

export const serviceConfig: ServiceConfig = {
  name: "Mini Shop Admin",
  description: "Admin interface for mini-shop.",
  script: path.join(__dirname, "bin", "www.js")
};
