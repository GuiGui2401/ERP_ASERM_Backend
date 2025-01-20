const express = require("express");

const {
  createAttendance,
  getAllAttendance,
  getSingleAttendance,
  getAttendanceByUserId,
  getLastAttendanceByUserId,
} = require("./attendance.controller");
const authorize = require("../../../../utils/authorize"); // authentication middleware

const attendanceRoutes = express.Router();

attendanceRoutes.post("/", authorize("CreateAttendance"), createAttendance);
attendanceRoutes.get("/", authorize("getAllAttendance"), getAllAttendance);
attendanceRoutes.get("/:id", authorize("getSingleAttendance"), getSingleAttendance);
attendanceRoutes.get("/:id/user", authorize("getAttendanceByUserId"), getAttendanceByUserId);
attendanceRoutes.get("/:id/last", authorize("getLastAttendanceByUserId"), getLastAttendanceByUserId);

module.exports = attendanceRoutes;
