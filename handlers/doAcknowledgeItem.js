import { getOrderItem, acknowledgeOrderItem } from "@cityssm/mini-shop-db";
export const handler = async (request, response) => {
    const itemIdentifiers = request.body;
    const orderItem = await getOrderItem(itemIdentifiers.orderID, itemIdentifiers.itemIndex);
    if (!orderItem) {
        return response.json({
            success: false,
            message: "Order Item Not Found"
        });
    }
    const allowedProductSKUs = request.session.user.productSKUs;
    if (!allowedProductSKUs.includes(orderItem.productSKU)) {
        return response.json({
            success: false,
            message: "Access Denied"
        });
    }
    const rightNow = new Date();
    const result = await acknowledgeOrderItem(itemIdentifiers.orderID, itemIdentifiers.itemIndex, {
        acknowledgedUser: request.session.user.userName,
        acknowledgedTime: rightNow
    });
    return response.json({
        success: result,
        orderID: itemIdentifiers.orderID,
        itemIndex: itemIdentifiers.itemIndex,
        acknowledgedUser: request.session.user.userName,
        acknowledgedTime: rightNow,
        itemIsAcknowledged: result
    });
};
export default handler;
