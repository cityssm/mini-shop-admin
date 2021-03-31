"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOrders_1 = require("@cityssm/mini-shop-db/getOrders");
;
const handler = async (req, res) => {
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
    switch (formFilters.orderStatus) {
        case "unpaid":
            queryFilters.orderIsPaid = 0;
            queryFilters.orderIsRefunded = 0;
            break;
        case "paid":
            queryFilters.orderIsPaid = 1;
            queryFilters.orderIsRefunded = 0;
            break;
        case "refunded":
            queryFilters.orderIsRefunded = 1;
            break;
    }
    if (formFilters.orderTimeMaxAgeDays !== "") {
        queryFilters.orderTimeMaxAgeDays = parseInt(formFilters.orderTimeMaxAgeDays, 10);
    }
    const orders = await getOrders_1.getOrders(queryFilters);
    return res.json({
        orders
    });
};
exports.handler = handler;
