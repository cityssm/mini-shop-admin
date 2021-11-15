import { Router } from "express";
import { handler as handler_doGetOrders } from "../handlers/doGetOrders.js";
import { handler as handler_doAcknowledgeItem } from "../handlers/doAcknowledgeItem.js";
import { handler as handler_doUnacknowledgeItem } from "../handlers/doUnacknowledgeItem.js";
export const router = Router();
router.get("/", (_request, response) => {
    response.render("orders");
});
router.post("/doGetOrders", handler_doGetOrders);
router.post("/doAcknowledgeItem", handler_doAcknowledgeItem);
router.post("/doUnacknowledgeItem", handler_doUnacknowledgeItem);
export default router;
