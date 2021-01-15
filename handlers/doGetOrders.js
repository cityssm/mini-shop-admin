"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOrders_1 = require("../../mini-shop-db/getOrders");
;
const handler = (req, res) => {
    const queryFilters = {};
    const formFilters = req.body;
    const allowedProductSKUs = req.session.user.productSKUs;
    if (formFilters.productSKU === "") {
        queryFilters.productSKUs = allowedProductSKUs;
    }
    else if (allowedProductSKUs.includes(formFilters.productSKU)) {
        queryFilters.productSKUs = [formFilters.productSKU];
    }
    else {
        return res.json({
            orders: []
        });
    }
    const orders = getOrders_1.getOrders(queryFilters);
    return res.json({
        orders
    });
};
exports.handler = handler;
