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
const getOrders_1 = require("../../mini-shop-db/getOrders");
;
const handler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const orders = yield getOrders_1.getOrders(queryFilters);
    return res.json({
        orders
    });
});
exports.handler = handler;
