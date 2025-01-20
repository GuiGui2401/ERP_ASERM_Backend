const express = require("express");
const {
    createSinglePromiseSaleInvoice,
    getAllPromiseSaleInvoice,
    getSinglePromiseSaleInvoice,
    getReminderNotifications,
} = require("./promiseSale.controllers");
const authorize = require("../../../../utils/authorize"); // authentication middleware

const promiseSaleRoutes = express.Router();

promiseSaleRoutes.post(
  "/",
  authorize("createSaleInvoice"),
  createSinglePromiseSaleInvoice
);
promiseSaleRoutes.get("/", authorize("viewSaleInvoice"), getAllPromiseSaleInvoice);
promiseSaleRoutes.get(
  "/:id",
  authorize("viewSaleInvoice"),
  getSinglePromiseSaleInvoice
);
promiseSaleRoutes.get(
  "/r/reminders",
  authorize("viewSaleInvoice"),
  getReminderNotifications
);

module.exports = promiseSaleRoutes;