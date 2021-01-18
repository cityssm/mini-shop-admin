"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var resultContainerEle = document.getElementById("container--results");
    var buildOrderBlockEle = function (order) {
        var blockEle = document.createElement("div");
        blockEle.className = "panel-block";
        return blockEle;
    };
    var renderGetOrdersResult = function (resultJSON) {
        if (resultJSON.orders.length === 0) {
            resultContainerEle.innerHTML = "<div class=\"message is-info\">" +
                "<div class=\"message-body\">" +
                "There are no orders available that meet your search criteria." +
                "</div>" +
                "</div>";
            return;
        }
        var panelEle = document.createElement("div");
        panelEle.className = "panel";
        for (var _i = 0, _a = resultJSON.orders; _i < _a.length; _i++) {
            var order = _a[_i];
            var panelBlockEle = buildOrderBlockEle(order);
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
        cityssm.postJSON("/orders/doGetOrders", filterFormEle, renderGetOrdersResult);
    };
    getOrders();
    document.getElementById("filter--productSKU").addEventListener("change", getOrders);
    document.getElementById("filter--orderStatus").addEventListener("change", getOrders);
})();
