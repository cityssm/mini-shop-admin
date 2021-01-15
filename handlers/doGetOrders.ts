// import { getOrders, GetOrderFilters } from "@cityssm/mini-shop-db/getOrders";
import { getOrders, GetOrderFilters } from "../../mini-shop-db/getOrders";

import type { RequestHandler } from "express";


interface FormFilters {
  productSKU: string;
};


export const handler: RequestHandler = (req, res) => {

  const queryFilters: GetOrderFilters = {};

  const formFilters = req.body as FormFilters;

  /*
   * Product SKUs
   */

  const allowedProductSKUs = req.session.user.productSKUs;

  if (formFilters.productSKU === "") {
    queryFilters.productSKUs = allowedProductSKUs;

  } else if (allowedProductSKUs.includes(formFilters.productSKU)) {
    queryFilters.productSKUs = [formFilters.productSKU];

  } else {
    return res.json({
      orders: []
    });
  }


  const orders = getOrders(queryFilters);

  return res.json({
    orders
  });

};
