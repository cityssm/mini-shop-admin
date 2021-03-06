"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_windows_1 = require("node-windows");
const path = require("path");
const svc = new node_windows_1.Service({
    name: "Mini Shop Admin",
    script: path.join(__dirname, "bin", "www.js")
});
svc.on("uninstall", function () {
    console.log("Uninstall complete.");
    console.log("The service exists: ", svc.exists);
});
svc.uninstall();
