import { Router } from "express";


import { handler as handler_doGetOrders } from "../handlers/doGetOrders";


const router = Router();


router.get("/", (_req, res) => {
  res.render("orders");
});


router.post("/doGetOrders", handler_doGetOrders);


export = router;
