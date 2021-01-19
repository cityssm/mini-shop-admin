import type * as cityssmTypes from "@cityssm/bulma-webapp-js/src/types";
import type { Order } from "../../mini-shop-db/types";
// import type { Order } from "@cityssm/mini-shop-db/types";


declare const cityssm: cityssmTypes.cityssmGlobal;


(() => {

  /*
   * Helper Functions
   */

  const isOrderFullyAcknowledged = (order: Order): boolean => {

    for (const item of order.items) {
      if (!item.itemIsAcknowledged) {
        return false;
      }
    }

    return true;
  };

  /*
   * Modal
   */

  const openOrderModal = (clickEvent: MouseEvent) => {

    const orderIndex = parseInt((clickEvent.currentTarget as HTMLAnchorElement).getAttribute("data-order-index"), 10);

    const order = orders[orderIndex];

    const onshownFn = (modalEle: HTMLDivElement, closeModalFn) => {

    };

    const onshowFn = (modalEle: HTMLDivElement) => {

      (modalEle.getElementsByClassName("order--orderNumber")[0] as HTMLSpanElement).innerText = order.orderNumber;

      const statusEle = (modalEle.getElementsByClassName("order--statusMessage")[0] as HTMLDivElement);

      if (order.orderIsRefunded) {

        statusEle.classList.add("is-warning");
        statusEle.innerHTML = "<div class=\"message-body\">" +
          "<strong>This order has been marked as refunded.</strong>" +
          "</div>";

      } else if (order.orderIsPaid) {

        statusEle.classList.add("is-success");
        statusEle.innerHTML = "<div class=\"message-body\">" +
          "<p class=\"has-text-weight-bold\">This order has been marked as paid.</p>" +
          "</div>";

      } else {

        statusEle.classList.add("is-danger");
        statusEle.innerHTML = "<div class=\"message-body\">" +
          "<strong>This order has been marked as unpaid.</strong>" +
          "</div>";
      }

      (modalEle.getElementsByClassName("order--shippingName")[0] as HTMLDivElement).innerText = order.shippingName;

      (modalEle.getElementsByClassName("order--shippingAddress")[0] as HTMLDivElement).innerHTML =
        cityssm.escapeHTML(order.shippingAddress1) + "<br />" +
        (order.shippingAddress2 ? cityssm.escapeHTML(order.shippingAddress2) + "<br />" : "") +
        cityssm.escapeHTML(order.shippingCity) + ", " + cityssm.escapeHTML(order.shippingProvince) + "<br />" +
        cityssm.escapeHTML(order.shippingPostalCode) + " &nbsp;" + cityssm.escapeHTML(order.shippingCountry);

      (modalEle.getElementsByClassName("order--shippingEmailAddress")[0] as HTMLDivElement).innerHTML =
        "<a href=\"mailto:" + cityssm.escapeHTML(order.shippingEmailAddress) + "\">" +
        order.shippingEmailAddress +
        "</a>";

      (modalEle.getElementsByClassName("order--shippingPhoneNumberDay")[0] as HTMLDivElement).innerText =
        order.shippingPhoneNumberDay;

      (modalEle.getElementsByClassName("order--shippingPhoneNumberEvening")[0] as HTMLDivElement).innerText =
        order.shippingPhoneNumberEvening;
    };

    cityssm.openHtmlModal("order-view", {
      onshow: onshowFn,
      onshown: onshownFn
    });
  };

  /*
   * Display Query Results
   */

  let orders: Order[] = null;

  const resultContainerEle = document.getElementById("container--results");

  const buildOrderBlockEle = (order: Order, orderIndex: number): HTMLAnchorElement => {

    const blockEle = document.createElement("a");
    blockEle.className = "panel-block is-block";
    blockEle.href = "#" + order.orderID.toString();
    blockEle.setAttribute("data-order-index", orderIndex.toString());
    blockEle.addEventListener("click", openOrderModal);

    const orderTime = new Date(order.orderTime);

    let orderTagHTML = "";

    if (order.orderIsRefunded) {
      orderTagHTML = "<span class=\"tag is-warning\">" +
        "Refunded" +
        "</span>";
    } else if (order.orderIsPaid) {
      orderTagHTML = "<span class=\"tag is-success\">" +
        "Paid" +
        "</span>";
    } else {
      orderTagHTML = "<span class=\"tag is-danger\">" +
        "Unpaid" +
        "</span>";
    }

    blockEle.innerHTML = "<div class=\"columns is-mobile is-multiline\">" +
      ("<div class=\"column is-narrow is-vcentered\">" +
        "<span class=\"icon m-2\">" +
        (isOrderFullyAcknowledged(order)
          ? "<i class=\"fas fa-3x fa-check-square is-success\" title=\"Acknowledged\"></i>"
          : "<i class=\"far fa-3x fa-square\" title=\"Not Acknowledged\"></i>") +
        "</span>" +
        "</div>") +
      ("<div class=\"column\">" +
        "<strong>" + cityssm.escapeHTML(order.orderNumber) + "</strong><br />" +
        cityssm.dateToString(orderTime) + " " +
        cityssm.dateToTimeString(orderTime) + " " +
        "</div>") +
      ("<div class=\"column is-full-mobile is-narrow has-text-right\">" +
        orderTagHTML +
        "</div>") +
      "</div>";

    return blockEle;
  };

  const renderGetOrdersResult = () => {

    if (orders.length === 0) {
      resultContainerEle.innerHTML = "<div class=\"message is-info\">" +
        "<div class=\"message-body\">" +
        "There are no orders available that meet your search criteria." +
        "</div>" +
        "</div>";

      return;
    }

    const panelEle = document.createElement("div");
    panelEle.className = "panel has-background-white";

    for (let orderIndex = 0; orderIndex < orders.length; orderIndex += 1) {
      const panelBlockEle = buildOrderBlockEle(orders[orderIndex], orderIndex);
      panelEle.appendChild(panelBlockEle);
    }

    cityssm.clearElement(resultContainerEle);
    resultContainerEle.appendChild(panelEle);
  };

  /*
   * Send Query to Database
   */

  const filterFormEle = document.getElementById("form--filters") as HTMLFormElement;

  const getOrders = () => {

    cityssm.clearElement(resultContainerEle);

    resultContainerEle.innerHTML = "<div class=\"has-text-centered p-4\">" +
      "<span class=\"icon\">" +
      "<i class=\"fas fa-4x fa-spinner fa-pulse\" aria-hidden=\"true\"></i>" +
      "</span>" +
      "</div>";

    cityssm.postJSON("/orders/doGetOrders", filterFormEle, (resultJSON: { orders: Order[] }) => {
      orders = resultJSON.orders;
      renderGetOrdersResult();
    });
  };

  /*
   * Initialize Page
   */

  getOrders();

  document.getElementById("filter--productSKU").addEventListener("change", getOrders);
  document.getElementById("filter--orderStatus").addEventListener("change", getOrders);
})();
