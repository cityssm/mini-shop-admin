import { getOrders } from "@cityssm/mini-shop-db";
export const handler = async (request, response) => {
    const queryFilters = {};
    const formFilters = request.body;
    const allowedProductSKUs = request.session.user.productSKUs;
    if (formFilters.productSKU === "") {
        queryFilters.productSKUs = allowedProductSKUs;
    }
    else if (allowedProductSKUs.includes(formFilters.productSKU)) {
        queryFilters.productSKUs = [formFilters.productSKU];
    }
    else {
        return response.json({
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
    switch (formFilters.acknowledgedStatus) {
        case "acknowledged":
            queryFilters.itemIsAcknowledged = 1;
            break;
        case "unacknowledged":
            queryFilters.itemIsAcknowledged = 0;
            break;
    }
    if (formFilters.orderTimeMaxAgeDays !== "") {
        queryFilters.orderTimeMaxAgeDays = Number.parseInt(formFilters.orderTimeMaxAgeDays, 10);
    }
    const orders = await getOrders(queryFilters);
    return response.json({
        orders
    });
};
export default handler;
