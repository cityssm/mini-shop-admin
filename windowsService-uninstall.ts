import { Service } from "node-windows";
import * as path from "path";

// Create a new service object
const svc = new Service({
  name: "Mini Shop Admin",
  script: path.join(__dirname, "bin", "www.js")
});

// Listen for the "uninstall" event so we know when it's done.
svc.on("uninstall", function() {
  console.log("Uninstall complete.");
  console.log("The service exists: ", svc.exists);
});

// Uninstall the service.
svc.uninstall();
