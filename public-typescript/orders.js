"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b, _c, _d;
    const products = exports.products;
    delete exports.products;
    const isOrderFullyAcknowledged = (order) => {
        for (const item of order.items) {
            if (!item.itemIsAcknowledged) {
                return false;
            }
        }
        return true;
    };
    let refreshResultsAfterClose = false;
    const acknowledgeItemFunction = (clickEvent) => {
        const buttonElement = clickEvent.currentTarget;
        const statusTdElement = buttonElement.closest("td");
        const itemTrElement = statusTdElement === null || statusTdElement === void 0 ? void 0 : statusTdElement.closest("tr");
        const modalElement = itemTrElement === null || itemTrElement === void 0 ? void 0 : itemTrElement.closest(".modal");
        const itemIndex = itemTrElement.getAttribute("data-item-index");
        const orderID = modalElement.getAttribute("data-order-id");
        const doAcknowledgeFunction = () => {
            cityssm.postJSON("/orders/doAcknowledgeItem", {
                orderID,
                itemIndex,
            }, (responseJSON) => {
                if (responseJSON.success) {
                    refreshResultsAfterClose = true;
                    const newStatusTdElement = buildAcknowledgeCellElement(responseJSON);
                    statusTdElement.remove();
                    itemTrElement.append(newStatusTdElement);
                }
            });
        };
        cityssm.confirmModal("Acknowledge Item?", "Are you sure you want to mark this item as acknowledged?", "Acknowledge", "success", doAcknowledgeFunction);
    };
    const unacknowledgeItemFunction = (clickEvent) => {
        const buttonElement = clickEvent.currentTarget;
        const statusTdElement = buttonElement.closest("td");
        const itemTrElement = statusTdElement === null || statusTdElement === void 0 ? void 0 : statusTdElement.closest("tr");
        const modalElement = itemTrElement === null || itemTrElement === void 0 ? void 0 : itemTrElement.closest(".modal");
        const itemIndex = itemTrElement.getAttribute("data-item-index");
        const orderID = modalElement.getAttribute("data-order-id");
        const doUnacknowledgeFunction = () => {
            cityssm.postJSON("/orders/doUnacknowledgeItem", {
                orderID,
                itemIndex,
            }, (responseJSON) => {
                if (responseJSON.success) {
                    refreshResultsAfterClose = true;
                    const newStatusTdElement = buildAcknowledgeCellElement({
                        itemIsAcknowledged: false,
                    });
                    statusTdElement.remove();
                    itemTrElement.append(newStatusTdElement);
                }
            });
        };
        cityssm.confirmModal("Unacknowledge Item?", "Are you sure you want to unacknowledge this item?", "Unacknowledge", "danger", doUnacknowledgeFunction);
    };
    const buildItemFieldBlockElement = (itemField, product) => {
        const field = product.formFieldsToSave.find((element) => {
            return element.formFieldName === itemField.formFieldName;
        });
        const fieldElement = document.createElement("div");
        fieldElement.className = "block";
        fieldElement.innerHTML =
            "<strong>" +
                cityssm.escapeHTML(field ? field.fieldName : itemField.formFieldName) +
                ":</strong><br />" +
                cityssm.escapeHTML(itemField.fieldValue);
        return fieldElement;
    };
    const buildAcknowledgeCellElement = (item) => {
        const tdElement = document.createElement("td");
        tdElement.className = "has-text-centered";
        if (item.itemIsAcknowledged) {
            tdElement.classList.add("is-success");
            const acknowledgedTime = new Date(item.acknowledgedTime);
            tdElement.innerHTML =
                "Acknowledged<br />" +
                    cityssm.dateToString(acknowledgedTime) +
                    "<br />" +
                    cityssm.escapeHTML(item.acknowledgedUser) +
                    "<br />";
            const buttonElement = document.createElement("button");
            buttonElement.className = "button is-small is-danger mt-2";
            buttonElement.type = "button";
            buttonElement.innerHTML = "Unacknowledge";
            buttonElement.addEventListener("click", unacknowledgeItemFunction);
            tdElement.append(buttonElement);
        }
        else {
            tdElement.classList.add("is-warning");
            const buttonElement = document.createElement("button");
            buttonElement.className = "button is-success";
            buttonElement.type = "button";
            buttonElement.innerHTML = "Acknowledge Item";
            buttonElement.addEventListener("click", acknowledgeItemFunction);
            tdElement.append(buttonElement);
        }
        return tdElement;
    };
    const buildItemRowElement = (item) => {
        const product = products[item.productSKU];
        const trElement = document.createElement("tr");
        trElement.dataset.itemIndex = item.itemIndex.toString();
        trElement.insertAdjacentHTML("beforeend", '<th scope="row">' +
            (product ? product.productName : item.productSKU) +
            "<br />" +
            "$" +
            (item.quantity * item.unitPrice).toFixed(2) +
            "</th>");
        const detailsTdElement = document.createElement("td");
        for (const itemField of item.fields) {
            const fieldElement = buildItemFieldBlockElement(itemField, product);
            detailsTdElement.append(fieldElement);
        }
        trElement.append(detailsTdElement);
        const statusTdElement = buildAcknowledgeCellElement(item);
        trElement.append(statusTdElement);
        return trElement;
    };
    const onhiddenFunction = () => {
        if (refreshResultsAfterClose) {
            getOrders(false);
        }
    };
    const openOrderModal = (clickEvent) => {
        const orderIndex = Number.parseInt(clickEvent.currentTarget.getAttribute("data-order-index"), 10);
        const order = orders[orderIndex];
        const onshowFunction = (modalElement) => {
            refreshResultsAfterClose = false;
            modalElement.dataset.orderId = order.orderID.toString();
            modalElement.querySelector(".order--orderNumber").textContent = order.orderNumber;
            const orderTime = new Date(order.orderTime);
            modalElement.querySelector(".order--orderTime").textContent =
                cityssm.dateToString(orderTime) +
                    " " +
                    cityssm.dateToTimeString(orderTime);
            const statusElement = modalElement.querySelector(".order--statusMessage");
            if (order.orderIsRefunded) {
                statusElement.classList.add("is-warning");
                statusElement.innerHTML =
                    '<div class="message-body">' +
                        "<strong>This order has been marked as refunded.</strong>" +
                        "</div>";
            }
            else if (order.orderIsPaid) {
                statusElement.classList.add("is-success");
                statusElement.innerHTML =
                    '<div class="message-body">' +
                        '<p class="has-text-weight-bold">This order has been marked as paid.</p>' +
                        "</div>";
            }
            else {
                statusElement.classList.add("is-danger");
                statusElement.innerHTML =
                    '<div class="message-body">' +
                        "<strong>This order has been marked as unpaid.</strong>" +
                        "</div>";
            }
            const itemsTbodyElement = document.querySelector(".order--items");
            for (const item of order.items) {
                const trElement = buildItemRowElement(item);
                itemsTbodyElement.append(trElement);
            }
            modalElement.querySelector(".order--shippingName").textContent = order.shippingName;
            modalElement.querySelector(".order--shippingAddress").innerHTML =
                cityssm.escapeHTML(order.shippingAddress1) +
                    "<br />" +
                    (order.shippingAddress2
                        ? cityssm.escapeHTML(order.shippingAddress2) + "<br />"
                        : "") +
                    cityssm.escapeHTML(order.shippingCity) +
                    ", " +
                    cityssm.escapeHTML(order.shippingProvince) +
                    "<br />" +
                    cityssm.escapeHTML(order.shippingPostalCode) +
                    " &nbsp;" +
                    cityssm.escapeHTML(order.shippingCountry || "");
            modalElement.querySelector(".order--shippingEmailAddress").innerHTML =
                '<a href="mailto:' +
                    cityssm.escapeHTML(order.shippingEmailAddress) +
                    "?subject=RE: " +
                    cityssm.escapeHTML(order.orderNumber) +
                    '">' +
                    cityssm.escapeHTML(order.shippingEmailAddress) +
                    "</a>";
            modalElement.querySelector(".order--shippingPhoneNumberDay").textContent = order.shippingPhoneNumberDay;
            modalElement.querySelector(".order--shippingPhoneNumberEvening").textContent = order.shippingPhoneNumberEvening;
        };
        cityssm.openHtmlModal("order-view", {
            onshow: onshowFunction,
            onhidden: onhiddenFunction,
        });
    };
    let orders;
    const resultContainerElement = document.querySelector("#container--results");
    const buildItemPreviewBlockElement = (order) => {
        const blockElement = document.createElement("div");
        const firstItem = order.items[0];
        const product = products[firstItem.productSKU];
        blockElement.innerHTML =
            cityssm.escapeHTML(product ? product.productName : firstItem.productSKU) +
                (order.items.length > 1
                    ? " and " +
                        (order.items.length - 1).toString() +
                        " other" +
                        (order.items.length > 2 ? "s" : "")
                    : "") +
                "<br />";
        if (firstItem.fields.length > 0) {
            const itemDetailsElement = document.createElement("span");
            itemDetailsElement.className = "is-size-7";
            itemDetailsElement.textContent = firstItem.fields
                .reduce((soFar, field) => {
                return soFar + ", " + field.fieldValue;
            }, "")
                .slice(2);
            blockElement.append(itemDetailsElement);
        }
        return blockElement;
    };
    const buildOrderBlockElement = (order, orderIndex) => {
        var _a;
        const blockElement = document.createElement("a");
        blockElement.className = "panel-block is-block";
        blockElement.href = "#" + order.orderID.toString();
        blockElement.dataset.orderIndex = orderIndex.toString();
        blockElement.addEventListener("click", openOrderModal);
        const orderTime = new Date(order.orderTime);
        let orderTagHTML = "";
        if (order.orderIsRefunded) {
            orderTagHTML = '<span class="tag is-warning">' + "Refunded" + "</span>";
        }
        else if (order.orderIsPaid) {
            orderTagHTML = '<span class="tag is-success">' + "Paid" + "</span>";
        }
        else {
            orderTagHTML = '<span class="tag is-danger">' + "Unpaid" + "</span>";
        }
        blockElement.innerHTML =
            '<div class="columns is-mobile is-multiline">' +
                ('<div class="column is-narrow is-vcentered">' +
                    '<span class="icon m-2">' +
                    (isOrderFullyAcknowledged(order)
                        ? '<i class="fas fa-3x fa-check-square is-success" title="Acknowledged"></i>'
                        : '<i class="far fa-3x fa-square" title="Not Acknowledged"></i>') +
                    "</span>" +
                    "</div>") +
                ('<div class="column">' +
                    "<strong>" +
                    cityssm.escapeHTML(order.orderNumber) +
                    "</strong><br />" +
                    cityssm.dateToString(orderTime) +
                    " " +
                    cityssm.dateToTimeString(orderTime) +
                    " " +
                    "</div>") +
                '<div class="column result--itemPreview"></div>' +
                ('<div class="column is-full-mobile is-narrow has-text-right">' +
                    orderTagHTML +
                    "</div>") +
                "</div>";
        (_a = blockElement === null || blockElement === void 0 ? void 0 : blockElement.querySelector(".result--itemPreview")) === null || _a === void 0 ? void 0 : _a.append(buildItemPreviewBlockElement(order));
        return blockElement;
    };
    const renderGetOrdersResult = () => {
        if (orders.length === 0) {
            resultContainerElement.innerHTML =
                '<div class="message is-info">' +
                    '<div class="message-body">' +
                    "There are no orders available that meet your search criteria." +
                    "</div>" +
                    "</div>";
            return;
        }
        const panelElement = document.createElement("div");
        panelElement.className = "panel has-background-white";
        for (const [orderIndex, order] of orders.entries()) {
            const panelBlockElement = buildOrderBlockElement(order, orderIndex);
            panelElement.append(panelBlockElement);
        }
        resultContainerElement.replaceChildren(panelElement);
    };
    const filterFormElement = document.querySelector("#form--filters");
    const getOrders = (showLoading = true) => {
        if (typeof showLoading === "object" || (typeof showLoading === "boolean" && showLoading)) {
            cityssm.clearElement(resultContainerElement);
            resultContainerElement.innerHTML =
                '<div class="has-text-centered p-4">' +
                    '<span class="icon">' +
                    '<i class="fas fa-4x fa-spinner fa-pulse" aria-hidden="true"></i>' +
                    "</span>" +
                    "</div>";
        }
        cityssm.postJSON("/orders/doGetOrders", filterFormElement, (resultJSON) => {
            orders = resultJSON.orders;
            renderGetOrdersResult();
        });
    };
    getOrders(true);
    (_a = document
        .querySelector("#filter--productSKU")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", getOrders);
    (_b = document
        .querySelector("#filter--orderStatus")) === null || _b === void 0 ? void 0 : _b.addEventListener("change", getOrders);
    (_c = document
        .querySelector("#filter--acknowledgedStatus")) === null || _c === void 0 ? void 0 : _c.addEventListener("change", getOrders);
    (_d = document
        .querySelector("#filter--orderTimeMaxAgeDays")) === null || _d === void 0 ? void 0 : _d.addEventListener("change", getOrders);
})();
