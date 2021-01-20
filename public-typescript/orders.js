"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var products = exports.products;
    delete exports.products;
    var isOrderFullyAcknowledged = function (order) {
        for (var _i = 0, _a = order.items; _i < _a.length; _i++) {
            var item = _a[_i];
            if (!item.itemIsAcknowledged) {
                return false;
            }
        }
        return true;
    };
    var refreshResultsAfterClose = false;
    var acknowledgeItemFn = function (clickEvent) {
        var buttonEle = clickEvent.currentTarget;
        var statusTdEle = buttonEle.closest("td");
        var itemTrEle = statusTdEle.closest("tr");
        var modalEle = itemTrEle.closest(".modal");
        var itemIndex = itemTrEle.getAttribute("data-item-index");
        var orderID = modalEle.getAttribute("data-order-id");
        var doAcknowledgeFn = function () {
            cityssm.postJSON("/orders/doAcknowledgeItem", {
                orderID: orderID,
                itemIndex: itemIndex
            }, function (responseJSON) {
                if (responseJSON.success) {
                    refreshResultsAfterClose = true;
                    var newStatusTdEle = buildAcknowledgeCellEle(responseJSON);
                    statusTdEle.remove();
                    itemTrEle.appendChild(newStatusTdEle);
                }
            });
        };
        cityssm.confirmModal("Acknowledge Item?", "Are you sure you want to mark this item as acknowledged?", "Acknowledge", "success", doAcknowledgeFn);
    };
    var buildItemFieldSpanEle = function (itemField, product) {
        var field = product.formFieldsToSave.find(function (ele) {
            return ele.formFieldName === itemField.formFieldName;
        });
        var spanEle = document.createElement("span");
        spanEle.innerHTML =
            "<strong>" + cityssm.escapeHTML(field ? field.fieldName : itemField.formFieldName) + ":</strong> " +
                cityssm.escapeHTML(itemField.fieldValue);
        return spanEle;
    };
    var buildAcknowledgeCellEle = function (item) {
        var tdEle = document.createElement("td");
        tdEle.className = "has-text-centered";
        if (item.itemIsAcknowledged) {
            tdEle.classList.add("is-success");
            var acknowledgedTime = new Date(item.acknowledgedTime);
            tdEle.innerHTML = "Acknowledged<br />" +
                cityssm.dateToString(acknowledgedTime) + "<br />" +
                cityssm.escapeHTML(item.acknowledgedUser);
        }
        else {
            tdEle.classList.add("is-warning");
            var buttonEle = document.createElement("button");
            buttonEle.className = "button is-success";
            buttonEle.type = "button";
            buttonEle.innerHTML = "Acknowledge Item";
            buttonEle.addEventListener("click", acknowledgeItemFn);
            tdEle.appendChild(buttonEle);
        }
        return tdEle;
    };
    var buildItemRowEle = function (item) {
        var product = products[item.productSKU];
        var trEle = document.createElement("tr");
        trEle.setAttribute("data-item-index", item.itemIndex.toString());
        trEle.insertAdjacentHTML("beforeend", "<th scope=\"row\">" +
            (product ? product.productName : item.productSKU) +
            "</th>");
        var detailsTdEle = document.createElement("td");
        for (var _i = 0, _a = item.fields; _i < _a.length; _i++) {
            var itemField = _a[_i];
            var spanEle = buildItemFieldSpanEle(itemField, product);
            detailsTdEle.appendChild(spanEle);
            detailsTdEle.insertAdjacentHTML("beforeend", "<br />");
        }
        trEle.appendChild(detailsTdEle);
        var statusTdEle = buildAcknowledgeCellEle(item);
        trEle.appendChild(statusTdEle);
        return trEle;
    };
    var openOrderModal = function (clickEvent) {
        var orderIndex = parseInt(clickEvent.currentTarget.getAttribute("data-order-index"), 10);
        var order = orders[orderIndex];
        var onhiddenFn = function () {
            if (refreshResultsAfterClose) {
                getOrders();
            }
        };
        var onshowFn = function (modalEle) {
            refreshResultsAfterClose = false;
            modalEle.setAttribute("data-order-id", order.orderID.toString());
            modalEle.getElementsByClassName("order--orderNumber")[0].innerText = order.orderNumber;
            var orderTime = new Date(order.orderTime);
            modalEle.getElementsByClassName("order--orderTime")[0].innerText =
                cityssm.dateToString(orderTime) + " " + cityssm.dateToTimeString(orderTime);
            var statusEle = modalEle.getElementsByClassName("order--statusMessage")[0];
            if (order.orderIsRefunded) {
                statusEle.classList.add("is-warning");
                statusEle.innerHTML = "<div class=\"message-body\">" +
                    "<strong>This order has been marked as refunded.</strong>" +
                    "</div>";
            }
            else if (order.orderIsPaid) {
                statusEle.classList.add("is-success");
                statusEle.innerHTML = "<div class=\"message-body\">" +
                    "<p class=\"has-text-weight-bold\">This order has been marked as paid.</p>" +
                    "</div>";
            }
            else {
                statusEle.classList.add("is-danger");
                statusEle.innerHTML = "<div class=\"message-body\">" +
                    "<strong>This order has been marked as unpaid.</strong>" +
                    "</div>";
            }
            var itemsTbodyEle = document.getElementsByClassName("order--items")[0];
            for (var _i = 0, _a = order.items; _i < _a.length; _i++) {
                var item = _a[_i];
                var trEle = buildItemRowEle(item);
                itemsTbodyEle.appendChild(trEle);
            }
            modalEle.getElementsByClassName("order--shippingName")[0].innerText = order.shippingName;
            modalEle.getElementsByClassName("order--shippingAddress")[0].innerHTML =
                cityssm.escapeHTML(order.shippingAddress1) + "<br />" +
                    (order.shippingAddress2 ? cityssm.escapeHTML(order.shippingAddress2) + "<br />" : "") +
                    cityssm.escapeHTML(order.shippingCity) + ", " + cityssm.escapeHTML(order.shippingProvince) + "<br />" +
                    cityssm.escapeHTML(order.shippingPostalCode) + " &nbsp;" + cityssm.escapeHTML(order.shippingCountry);
            modalEle.getElementsByClassName("order--shippingEmailAddress")[0].innerHTML =
                "<a href=\"mailto:" + cityssm.escapeHTML(order.shippingEmailAddress) + "\">" +
                    order.shippingEmailAddress +
                    "</a>";
            modalEle.getElementsByClassName("order--shippingPhoneNumberDay")[0].innerText =
                order.shippingPhoneNumberDay;
            modalEle.getElementsByClassName("order--shippingPhoneNumberEvening")[0].innerText =
                order.shippingPhoneNumberEvening;
        };
        cityssm.openHtmlModal("order-view", {
            onshow: onshowFn,
            onhidden: onhiddenFn
        });
    };
    var orders = null;
    var resultContainerEle = document.getElementById("container--results");
    var buildOrderBlockEle = function (order, orderIndex) {
        var blockEle = document.createElement("a");
        blockEle.className = "panel-block is-block";
        blockEle.href = "#" + order.orderID.toString();
        blockEle.setAttribute("data-order-index", orderIndex.toString());
        blockEle.addEventListener("click", openOrderModal);
        var orderTime = new Date(order.orderTime);
        var orderTagHTML = "";
        if (order.orderIsRefunded) {
            orderTagHTML = "<span class=\"tag is-warning\">" +
                "Refunded" +
                "</span>";
        }
        else if (order.orderIsPaid) {
            orderTagHTML = "<span class=\"tag is-success\">" +
                "Paid" +
                "</span>";
        }
        else {
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
    var renderGetOrdersResult = function () {
        if (orders.length === 0) {
            resultContainerEle.innerHTML = "<div class=\"message is-info\">" +
                "<div class=\"message-body\">" +
                "There are no orders available that meet your search criteria." +
                "</div>" +
                "</div>";
            return;
        }
        var panelEle = document.createElement("div");
        panelEle.className = "panel has-background-white";
        for (var orderIndex = 0; orderIndex < orders.length; orderIndex += 1) {
            var panelBlockEle = buildOrderBlockEle(orders[orderIndex], orderIndex);
            panelEle.appendChild(panelBlockEle);
        }
        cityssm.clearElement(resultContainerEle);
        resultContainerEle.appendChild(panelEle);
    };
    var filterFormEle = document.getElementById("form--filters");
    var getOrders = function () {
        cityssm.clearElement(resultContainerEle);
        resultContainerEle.innerHTML = "<div class=\"has-text-centered p-4\">" +
            "<span class=\"icon\">" +
            "<i class=\"fas fa-4x fa-spinner fa-pulse\" aria-hidden=\"true\"></i>" +
            "</span>" +
            "</div>";
        cityssm.postJSON("/orders/doGetOrders", filterFormEle, function (resultJSON) {
            orders = resultJSON.orders;
            renderGetOrdersResult();
        });
    };
    getOrders();
    document.getElementById("filter--productSKU").addEventListener("change", getOrders);
    document.getElementById("filter--orderStatus").addEventListener("change", getOrders);
})();
