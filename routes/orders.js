"use strict";
const express_1 = require("express");
const doGetOrders_1 = require("../handlers/doGetOrders");
const doAcknowledgeItem_1 = require("../handlers/doAcknowledgeItem");
const doUnacknowledgeItem_1 = require("../handlers/doUnacknowledgeItem");
const router = express_1.Router();
router.get("/", (_req, res) => {
    res.render("orders");
});
router.post("/doGetOrders", doGetOrders_1.handler);
router.post("/doAcknowledgeItem", doAcknowledgeItem_1.handler);
router.post("/doUnacknowledgeItem", doUnacknowledgeItem_1.handler);
module.exports = router;
