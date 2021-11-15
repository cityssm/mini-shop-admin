import path from "path";
const __dirname = ".";
export const serviceConfig = {
    name: "Mini Shop Admin",
    description: "Admin interface for mini-shop.",
    script: path.join(__dirname, "bin", "www.js")
};
