import { getOrderItem, unacknowledgeOrderItem } from "@cityssm/mini-shop-db";

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

  const result = await unacknowledgeOrderItem(itemIdentifiers.orderID, itemIdentifiers.itemIndex);

  return response.json({
    success: result,
    orderID: itemIdentifiers.orderID,
    itemIndex: itemIdentifiers.itemIndex
  });
};

export default handler;
