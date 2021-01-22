import { getOrders, GetOrderFilters } from "@cityssm/mini-shop-db/getOrders";

import type { RequestHandler } from "express";


interface FormFilters {
  productSKU: string;
  orderStatus: "" | "unpaid" | "paid" | "refunded";
  orderTimeMaxAgeDays: "" | "10" | "30" | "60" | "90";
};


export const handler: RequestHandler = async (req, res) => {

  const queryFilters: GetOrderFilters = {};

  const formFilters = req.body as FormFilters;

  /*
   * Product SKUs (enforces permissions)
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

  /*
   * Order Status
   */

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

  /*
   * Order Time - Max Age Days
   */

  if (formFilters.orderTimeMaxAgeDays !== "") {
    queryFilters.orderTimeMaxAgeDays = parseInt(formFilters.orderTimeMaxAgeDays, 10);
  }

  const orders = await getOrders(queryFilters);

  return res.json({
    orders
  });

};
