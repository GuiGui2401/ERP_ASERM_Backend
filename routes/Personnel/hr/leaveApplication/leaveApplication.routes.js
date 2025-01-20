const express = require("express");

const {
  createSingleLeave,
  getAllLeave,
  getSingleLeave,
  grantedLeave,
  getLeaveByUserId,
} = require("./leaveApplication.controller");
const authorize = require("../../../../utils/authorize"); // authentication middleware

const leaveApplicationRoutes = express.Router();

leaveApplicationRoutes.post("/", authorize("create-leaveApplication"), createSingleLeave);
leaveApplicationRoutes.get("/", authorize("readAll-leaveApplication"), getAllLeave);
leaveApplicationRoutes.get("/:id", authorize("readSingle-leaveApplication"), getSingleLeave);
leaveApplicationRoutes.put(
  "/:id",
  authorize("update-leaveApplication"),
  grantedLeave
);
leaveApplicationRoutes.get(
  "/:id/leaveHistory",
  authorize("readByUserId-leaveApplication"),
  getLeaveByUserId
);

module.exports = leaveApplicationRoutes;
