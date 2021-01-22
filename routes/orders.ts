import { Router } from "express";


import { handler as handler_doGetOrders } from "../handlers/doGetOrders";
import { handler as handler_doAcknowledgeItem } from "../handlers/doAcknowledgeItem";
import { handler as handler_doUnacknowledgeItem } from "../handlers/doUnacknowledgeItem";


const router = Router();


router.get("/", (_req, res) => {
  res.render("orders");
});


router.post("/doGetOrders", handler_doGetOrders);

router.post("/doAcknowledgeItem", handler_doAcknowledgeItem);

router.post("/doUnacknowledgeItem", handler_doUnacknowledgeItem);


export = router;
