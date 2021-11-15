import { getOrderItem, acknowledgeOrderItem } from "@cityssm/mini-shop-db";

import type { RequestHandler } from "express";


interface ItemIdentifiers {
  orderID: string;
  itemIndex: string;
}


export const handler: RequestHandler = async (request, response) => {

  const itemIdentifiers = request.body as ItemIdentifiers;

  const orderItem = await getOrderItem(itemIdentifiers.orderID, itemIdentifiers.itemIndex);

  if (!orderItem) {
    return response.json({
      success: false,
      message: "Order Item Not Found"
    });
  }

  /*
   * Product SKUs (enforces permissions)
   */


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
