"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOrderItem_1 = require("@cityssm/mini-shop-db/getOrderItem");
const acknowledgeOrderItem_1 = require("@cityssm/mini-shop-db/acknowledgeOrderItem");
;
const handler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const itemIdentifiers = req.body;
    const orderItem = yield getOrderItem_1.getOrderItem(itemIdentifiers.orderID, itemIdentifiers.itemIndex);
    if (!orderItem) {
        return res.json({
            success: false,
            message: "Order Item Not Found"
        });
    }
    const allowedProductSKUs = req.session.user.productSKUs;
    if (!allowedProductSKUs.includes(orderItem.productSKU)) {
        return res.json({
            success: false,
            message: "Access Denied"
        });
    }
    const rightNow = new Date();
    const result = yield acknowledgeOrderItem_1.acknowledgeOrderItem(itemIdentifiers.orderID, itemIdentifiers.itemIndex, {
        acknowledgedUser: req.session.user.userName,
        acknowledgedTime: rightNow
    });
    return res.json({
        success: result,
        orderID: itemIdentifiers.orderID,
        itemIndex: itemIdentifiers.itemIndex,
        acknowledgedUser: req.session.user.userName,
        acknowledgedTime: rightNow,
        itemIsAcknowledged: result
    });
});
exports.handler = handler;
