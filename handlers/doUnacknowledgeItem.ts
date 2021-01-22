import { getOrderItem } from "@cityssm/mini-shop-db/getOrderItem";
import { unacknowledgeOrderItem } from "@cityssm/mini-shop-db/unacknowledgeOrderItem";

import type { RequestHandler } from "express";


interface ItemIdentifiers {
  orderID: string;
  itemIndex: string;
};


export const handler: RequestHandler = async (req, res) => {

  const itemIdentifiers = req.body as ItemIdentifiers;

  const orderItem = await getOrderItem(itemIdentifiers.orderID, itemIdentifiers.itemIndex);

  if (!orderItem) {
    return res.json({
      success: false,
      message: "Order Item Not Found"
    });
  }

  /*
   * Product SKUs (enforces permissions)
   */


  const allowedProductSKUs = req.session.user.productSKUs;

  if (!allowedProductSKUs.includes(orderItem.productSKU)) {
    return res.json({
      success: false,
      message: "Access Denied"
    });
  }

  const result = await unacknowledgeOrderItem(itemIdentifiers.orderID, itemIdentifiers.itemIndex);

  return res.json({
    success: result,
    orderID: itemIdentifiers.orderID,
    itemIndex: itemIdentifiers.itemIndex
  });
};
