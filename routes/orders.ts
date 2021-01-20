import { Router } from "express";


import { handler as handler_doGetOrders } from "../handlers/doGetOrders";
import { handler as handler_doAcknowledgeItem } from "../handlers/doAcknowledgeItem";


const router = Router();


router.get("/", (_req, res) => {
  res.render("orders");
});


router.post("/doGetOrders", handler_doGetOrders);

router.post("/doAcknowledgeItem", handler_doAcknowledgeItem);


export = router;
