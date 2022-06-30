import { getOrders } from "@cityssm/mini-shop-db";

import type { GetOrderFilters } from "@cityssm/mini-shop-db/getOrders";

import type { RequestHandler } from "express";


interface FormFilters {
  productSKU: string;
  orderStatus: "" | "unpaid" | "paid" | "refunded";
  acknowledgedStatus: "" | "acknowledged" | "unacknowledged";
  orderTimeMaxAgeDays: "" | "10" | "30" | "60" | "90";
}


export const handler: RequestHandler = async (request, response) => {

  const queryFilters: GetOrderFilters = {};

  const formFilters = request.body as FormFilters;

  /*
   * Product SKUs (enforces permissions)
   */

  const allowedProductSKUs = request.session.user.productSKUs;

  if (formFilters.productSKU === "") {
    queryFilters.productSKUs = allowedProductSKUs;

  } else if (allowedProductSKUs.includes(formFilters.productSKU)) {
    queryFilters.productSKUs = [formFilters.productSKU];

  } else {
    return response.json({
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
   * Acknowledged Status
   */

  switch (formFilters.acknowledgedStatus) {

    case "acknowledged":
      queryFilters.itemIsAcknowledged = 1;
      break;

    case "unacknowledged":
      queryFilters.itemIsAcknowledged = 0;
      break;
  }

  /*
   * Order Time - Max Age Days
   */

  if (formFilters.orderTimeMaxAgeDays !== "") {
    queryFilters.orderTimeMaxAgeDays = Number.parseInt(formFilters.orderTimeMaxAgeDays, 10);
  }

  const orders = await getOrders(queryFilters);

  return response.json({
    orders
  });
};

export default handler;
