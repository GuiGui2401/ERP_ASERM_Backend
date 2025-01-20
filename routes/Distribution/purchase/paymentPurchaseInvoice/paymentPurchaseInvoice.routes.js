const express = require("express");
const {
  createPaymentPurchaseInvoice,
  getAllPaymentPurchaseInvoice,
  getSinglePaymentPurchaseInvoice,
  // updateSinglePaymentPurchaseInvoice,
  // deleteSinglePaymentPurchaseInvoice,
} = require("./paymentPurchaseInvoice.controllers");
const authorize = require("../../../../utils/authorize"); // authentication middleware

const paymentSupplierRoutes = express.Router();

paymentSupplierRoutes.post(
  "/",
  authorize("createPaymentPurchaseInvoice"),
  createPaymentPurchaseInvoice
);
paymentSupplierRoutes.get(
  "/",
  authorize("viewPaymentPurchaseInvoice"),
  getAllPaymentPurchaseInvoice
);
paymentSupplierRoutes.get("/:id", authorize("viewPaymentPurchaseInvoice"), getSinglePaymentPurchaseInvoice);
// paymentSupplierRoutes.put("/:id", updateSinglePaymentSupplier);
// paymentSupplierRoutes.delete("/:id", deleteSinglePaymentSupplier);

module.exports = paymentSupplierRoutes;
