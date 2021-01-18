import type * as cityssmTypes from "@cityssm/bulma-webapp-js/src/types";
import type { Order } from "@cityssm/mini-shop-db/types";


declare const cityssm: cityssmTypes.cityssmGlobal;


(() => {

  const resultContainerEle = document.getElementById("container--results");

  const buildOrderBlockEle = (order: Order): HTMLDivElement => {

    const blockEle = document.createElement("div");
    blockEle.className = "panel-block";

    return blockEle;
  };

  const renderGetOrdersResult = (resultJSON: { orders: Order[] }) => {

    if (resultJSON.orders.length === 0) {
      resultContainerEle.innerHTML = "<div class=\"message is-info\">" +
        "<div class=\"message-body\">" +
        "There are no orders available that meet your search criteria." +
        "</div>" +
        "</div>";

      return;
    }

    const panelEle = document.createElement("div");
    panelEle.className = "panel";

    for (const order of resultJSON.orders) {
      const panelBlockEle = buildOrderBlockEle(order);
      panelEle.appendChild(panelBlockEle);
    }

    cityssm.clearElement(resultContainerEle);
    resultContainerEle.appendChild(panelEle);
  };

  const filterFormEle = document.getElementById("form--filters") as HTMLFormElement;

  const getOrders = () => {

    cityssm.clearElement(resultContainerEle);

    resultContainerEle.innerHTML = "<div class=\"has-text-centered p-4\">" +
      "<span class=\"icon\">" +
      "<i class=\"fas fa-4x fa-spinner fa-pulse\" aria-hidden=\"true\"></i>" +
      "</span>" +
      "</div>";

    cityssm.postJSON("/orders/doGetOrders", filterFormEle, renderGetOrdersResult);
  };

  getOrders();

  document.getElementById("filter--productSKU").addEventListener("change", getOrders);
  document.getElementById("filter--orderStatus").addEventListener("change", getOrders);
})();
