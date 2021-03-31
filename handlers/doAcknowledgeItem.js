"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOrderItem_1 = require("@cityssm/mini-shop-db/getOrderItem");
const acknowledgeOrderItem_1 = require("@cityssm/mini-shop-db/acknowledgeOrderItem");
;
const handler = async (req, res) => {
    const itemIdentifiers = req.body;
    const orderItem = await getOrderItem_1.getOrderItem(itemIdentifiers.orderID, itemIdentifiers.itemIndex);
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
    const result = await acknowledgeOrderItem_1.acknowledgeOrderItem(itemIdentifiers.orderID, itemIdentifiers.itemIndex, {
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
};
exports.handler = handler;
