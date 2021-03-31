import type * as cityssmTypes from "@cityssm/bulma-webapp-js/src/types";
import type * as configTypes from "../types/configTypes";
import type { Order, OrderItemField, OrderItem } from "@cityssm/mini-shop-db/types";


declare const cityssm: cityssmTypes.cityssmGlobal;


interface OrderItem_Acknowledge {
  success?: boolean;
  message?: string;
  acknowledgedTime?: Date;
  acknowledgedUser?: string;
  itemIsAcknowledged?: boolean;
}


(() => {

  const products = exports.products as {
    [productSKU: string]: configTypes.Config_Product;
  };

  delete exports.products;

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

  let refreshResultsAfterClose = false;

  const acknowledgeItemFn = (clickEvent: MouseEvent) => {

    const buttonEle = clickEvent.currentTarget as HTMLButtonElement;

    const statusTdEle = buttonEle.closest("td");
    const itemTrEle = statusTdEle.closest("tr");
    const modalEle = itemTrEle.closest(".modal");

    const itemIndex = itemTrEle.getAttribute("data-item-index");
    const orderID = modalEle.getAttribute("data-order-id");

    const doAcknowledgeFn = () => {

      cityssm.postJSON("/orders/doAcknowledgeItem", {
        orderID,
        itemIndex
      }, (responseJSON: OrderItem_Acknowledge) => {

        if (responseJSON.success) {

          refreshResultsAfterClose = true;

          const newStatusTdEle = buildAcknowledgeCellEle(responseJSON);

          statusTdEle.remove();

          itemTrEle.appendChild(newStatusTdEle);
        }
      });
    };

    cityssm.confirmModal("Acknowledge Item?",
      "Are you sure you want to mark this item as acknowledged?",
      "Acknowledge",
      "success",
      doAcknowledgeFn);
  };

  const unacknowledgeItemFn = (clickEvent: MouseEvent) => {

    const buttonEle = clickEvent.currentTarget as HTMLButtonElement;

    const statusTdEle = buttonEle.closest("td");
    const itemTrEle = statusTdEle.closest("tr");
    const modalEle = itemTrEle.closest(".modal");

    const itemIndex = itemTrEle.getAttribute("data-item-index");
    const orderID = modalEle.getAttribute("data-order-id");

    const doUnacknowledgeFn = () => {

      cityssm.postJSON("/orders/doUnacknowledgeItem", {
        orderID,
        itemIndex
      }, (responseJSON: { success: boolean }) => {

        if (responseJSON.success) {

          refreshResultsAfterClose = true;

          const newStatusTdEle = buildAcknowledgeCellEle({
            itemIsAcknowledged: false
          });

          statusTdEle.remove();

          itemTrEle.appendChild(newStatusTdEle);
        }
      });
    };

    cityssm.confirmModal("Unacknowledge Item?",
      "Are you sure you want to unacknowledge this item?",
      "Unacknowledge",
      "danger",
      doUnacknowledgeFn);
  };

  const buildItemFieldBlockEle = (itemField: OrderItemField, product: configTypes.Config_Product): HTMLDivElement => {

    const field = product.formFieldsToSave.find((ele) => {
      return ele.formFieldName === itemField.formFieldName;
    });

    const fieldEle = document.createElement("div");
    fieldEle.className = "block";

    fieldEle.innerHTML =
      "<strong>" + cityssm.escapeHTML(field ? field.fieldName : itemField.formFieldName) + ":</strong><br />" +
      cityssm.escapeHTML(itemField.fieldValue);

    return fieldEle;
  };

  const buildAcknowledgeCellEle = (item: OrderItem_Acknowledge): HTMLTableCellElement => {

    const tdEle = document.createElement("td");
    tdEle.className = "has-text-centered";

    if (item.itemIsAcknowledged) {
      tdEle.classList.add("is-success");

      const acknowledgedTime = new Date(item.acknowledgedTime);

      tdEle.innerHTML = "Acknowledged<br />" +
        cityssm.dateToString(acknowledgedTime) + "<br />" +
        cityssm.escapeHTML(item.acknowledgedUser) + "<br />";

      const buttonEle = document.createElement("button");
      buttonEle.className = "button is-small is-danger mt-2";
      buttonEle.type = "button";
      buttonEle.innerHTML = "Unacknowledge";
      buttonEle.addEventListener("click", unacknowledgeItemFn);

      tdEle.appendChild(buttonEle);

    } else {
      tdEle.classList.add("is-warning");

      const buttonEle = document.createElement("button");
      buttonEle.className = "button is-success";
      buttonEle.type = "button";
      buttonEle.innerHTML = "Acknowledge Item";
      buttonEle.addEventListener("click", acknowledgeItemFn);

      tdEle.appendChild(buttonEle);
    }

    return tdEle;
  };

  const buildItemRowEle = (item: OrderItem): HTMLTableRowElement => {

    const product = products[item.productSKU];

    const trEle = document.createElement("tr");
    trEle.setAttribute("data-item-index", item.itemIndex.toString());

    // Item

    trEle.insertAdjacentHTML("beforeend",
      "<th scope=\"row\">" +
      (product ? product.productName : item.productSKU) +
      "</th>");

    // Details

    const detailsTdEle = document.createElement("td");

    for (const itemField of item.fields) {
      const fieldEle = buildItemFieldBlockEle(itemField, product);
      detailsTdEle.appendChild(fieldEle);
    }

    trEle.appendChild(detailsTdEle);

    // Status

    const statusTdEle = buildAcknowledgeCellEle(item);

    trEle.appendChild(statusTdEle);

    return trEle;
  };

  const openOrderModal = (clickEvent: MouseEvent) => {

    const orderIndex = parseInt((clickEvent.currentTarget as HTMLAnchorElement).getAttribute("data-order-index"), 10);

    const order = orders[orderIndex];

    const onhiddenFn = () => {
      if (refreshResultsAfterClose) {
        getOrders();
      }
    };

    const onshowFn = (modalEle: HTMLDivElement) => {

      refreshResultsAfterClose = false;

      modalEle.setAttribute("data-order-id", order.orderID.toString());

      (modalEle.getElementsByClassName("order--orderNumber")[0] as HTMLSpanElement).innerText = order.orderNumber;

      const orderTime = new Date(order.orderTime);

      (modalEle.getElementsByClassName("order--orderTime")[0] as HTMLSpanElement).innerText =
        cityssm.dateToString(orderTime) + " " + cityssm.dateToTimeString(orderTime);

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

      /*
       * Items
       */

      const itemsTbodyEle = document.getElementsByClassName("order--items")[0] as HTMLTableSectionElement;

      for (const item of order.items) {
        const trEle = buildItemRowEle(item);
        itemsTbodyEle.appendChild(trEle);
      }

      /*
       * Shipping Details
       */

      (modalEle.getElementsByClassName("order--shippingName")[0] as HTMLDivElement).innerText = order.shippingName;

      (modalEle.getElementsByClassName("order--shippingAddress")[0] as HTMLDivElement).innerHTML =
        cityssm.escapeHTML(order.shippingAddress1) + "<br />" +
        (order.shippingAddress2 ? cityssm.escapeHTML(order.shippingAddress2) + "<br />" : "") +
        cityssm.escapeHTML(order.shippingCity) + ", " + cityssm.escapeHTML(order.shippingProvince) + "<br />" +
        cityssm.escapeHTML(order.shippingPostalCode) + " &nbsp;" + cityssm.escapeHTML(order.shippingCountry || "");

      (modalEle.getElementsByClassName("order--shippingEmailAddress")[0] as HTMLDivElement).innerHTML =
        "<a href=\"mailto:" + cityssm.escapeHTML(order.shippingEmailAddress) + "?subject=RE: " + cityssm.escapeHTML(order.orderNumber) + "\">" +
        cityssm.escapeHTML(order.shippingEmailAddress) +
        "</a>";

      (modalEle.getElementsByClassName("order--shippingPhoneNumberDay")[0] as HTMLDivElement).innerText =
        order.shippingPhoneNumberDay;

      (modalEle.getElementsByClassName("order--shippingPhoneNumberEvening")[0] as HTMLDivElement).innerText =
        order.shippingPhoneNumberEvening;
    };

    cityssm.openHtmlModal("order-view", {
      onshow: onshowFn,
      onhidden: onhiddenFn
    });
  };

  /*
   * Display Query Results
   */

  let orders: Order[] = null;

  const resultContainerEle = document.getElementById("container--results");

  const buildItemPreviewBlockEle = (order: Order): HTMLDivElement => {

    const blockEle = document.createElement("div");

    const firstItem = order.items[0];
    const product = products[firstItem.productSKU];

    blockEle.innerHTML =
      cityssm.escapeHTML(product
        ? product.productName
        : firstItem.productSKU) +
      (order.items.length > 1
        ? " and " + (order.items.length - 1).toString() + " other" + (order.items.length > 2 ? "s" : "")
        : "") +
      "<br />";

    if (firstItem.fields.length > 0) {

      const itemDetailsEle = document.createElement("span");
      itemDetailsEle.className = "is-size-7";

      itemDetailsEle.innerText = firstItem.fields.reduce((soFar, field) => {
        return soFar + ", " + field.fieldValue;
      }, "").substring(2);

      blockEle.appendChild(itemDetailsEle);
    }

    return blockEle;
  };

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
      ("<div class=\"column result--itemPreview\"></div>") +
      ("<div class=\"column is-full-mobile is-narrow has-text-right\">" +
        orderTagHTML +
        "</div>") +
      "</div>";

    blockEle.getElementsByClassName("result--itemPreview")[0].appendChild(buildItemPreviewBlockEle(order));

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
  document.getElementById("filter--orderTimeMaxAgeDays").addEventListener("change", getOrders);
})();
