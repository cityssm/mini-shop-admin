import { getOrderItem } from "@cityssm/mini-shop-db/getOrderItem";
import { acknowledgeOrderItem } from "@cityssm/mini-shop-db/acknowledgeOrderItem";

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

  const rightNow = new Date();

  const result = await acknowledgeOrderItem(itemIdentifiers.orderID, itemIdentifiers.itemIndex, {
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
