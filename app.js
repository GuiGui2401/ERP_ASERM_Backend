const rateLimit = require("express-rate-limit");
const compression = require("compression");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const mime = require("mime");

///////////////////// Variables Distribution

const paymentPurchaseInvoiceRoutes = require("./routes/Distribution/purchase/paymentPurchaseInvoice/paymentPurchaseInvoice.routes");
const paymentSaleInvoiceRoutes = require("./routes/Distribution/sale/paymentSaleInvoice/paymentSaleInvoice.routes");
const returnSaleInvoiceRoutes = require("./routes/Distribution/sale/returnSaleInvoice/returnSaleInvoice.routes");
const purchaseInvoiceRoutes = require("./routes/Distribution/purchase/purchaseInvoice/purchaseInvoice.routes");
const returnPurchaseInvoiceRoutes = require("./routes/Distribution/purchase/returnPurchaseInvoice/returnPurchaseInvoice.routes");
const dashboardRoutes = require("./routes/Distribution/dashboard/dashboard.routes");
const customerRoutes = require("./routes/Distribution/sale/customer/customer.routes");
const supplierRoutes = require("./routes/Distribution/purchase/supplier/supplier.routes");
const {
  productRoutes,
  productImageRoutes,
} = require("./routes/Distribution/inventory/product/product.routes");
const saleInvoiceRoutes = require("./routes/Distribution/sale/saleInvoice/saleInvoice.routes");
const productCategoryRoutes = require("./routes/Distribution/inventory/productCategory/productCategory.routes");
const promiseSaleRoutes = require("./routes/Distribution/sale/promiseSale/promiseSale.routes");


const transactionRoutes = require("./routes/accounting/transaction/transaction.routes");
const userRoutes = require("./routes/user/user.routes");
const accountRoutes = require("./routes/accounting/account/account.routes");
const settingRoutes = require("./routes/setting/setting.routes");
const smsRouter = require("./routes/sms/sms.routes");
const getAuditLogs = require("./routes/AuditLog/auditlog.routes");
const authRoutes = require('./routes/auth.routes');

const reportingRoutes = require('./routes/Distribution/sale/reporting/reporting.routes');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

/* variables */
// express app instance
const app = express();
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    const filetypes = /xlsx|xls/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Seuls les fichiers Excel sont autorisés"));
  }
});

// Endpoint pour uploader et parser le fichier Excel
router.post('/v1/upload-excel', upload.single('file'), (req, res) => {
  try {
    console.log("Requête reçue !");
    console.log("Headers :", req.headers);
    console.log("Fichier reçu :", req.file);

    if (!req.file) {
      console.log("Aucun fichier reçu!");
      return res.status(400).json({ success: false, message: 'Aucun fichier n\'a été uploadé' });
    }

    // Lire le fichier Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetNameList = workbook.SheetNames;
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);


    return res.status(200).json({
      success: true,
      message: 'Fichier traité avec succès',
      data: data
    });
  } catch (error) {
    console.error('Erreur lors du traitement du fichier:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors du traitement du fichier'
    });
  }
});

module.exports = router;


// holds all the allowed origins for cors access
let allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3002",
  "http://localhost:5002",
  "https://erp-os-frontend.vercel.app/",
  "http://192.168.1.176:3000",
  "http://192.168.1.176:5000",
  "https://erpasermpharma-b64f86e34423.herokuapp.com",
  "https://erpasermpharma.com",
  "http://192.168.1.12"
];

// limit the number of requests from a single IP address
// verification
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
  standardHeaders: false, // Disable rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/* Middleware */
// for compressing the response body
app.use(compression());
// helmet: secure express app by setting various HTTP headers. And serve cross origin resources.
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// morgan: log requests to console in dev environment
app.use(morgan("dev"));




// app.use('/', router);
// allows cors access from allowedOrigins array
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.options('*', cors());// Permet à toutes les routes de gérer les pré-requêtes

// Serve JavaScript files with the correct MIME type
app.use((req, res, next) => {
  if (req.url.endsWith(".js")) {
    res.setHeader("Content-Type", "application/javascript");
  }
  next();
});

// parse requests of content-type - application/json
app.use(express.json({ extended: true }));

/* Routes For SMS */
app.use("/v1/payment-purchase-invoice", paymentPurchaseInvoiceRoutes);
app.use("/v1/payment-sale-invoice", paymentSaleInvoiceRoutes);
app.use("/v1/purchase-invoice", purchaseInvoiceRoutes);
app.use("/v1/return-purchase-invoice", returnPurchaseInvoiceRoutes);
// app.use("/v1/role-permission", rolePermissionRoutes);
app.use("/v1/sale-invoice", saleInvoiceRoutes);
app.use("/v1/sale-promise", promiseSaleRoutes);
app.use("/v1/return-sale-invoice", returnSaleInvoiceRoutes);
app.use("/v1/transaction", transactionRoutes);
// app.use("/v1/permission", permissionRoutes);
app.use("/v1/dashboardDistribution", dashboardRoutes);
app.use("/v1/user", limiter, userRoutes);
app.use("/v1/customer", customerRoutes);

app.use('/v1/reporting', reportingRoutes); // Route de reporting

// Middleware pour servir les fichiers téléchargés
app.use('/uploads', express.static('uploads')); // Permet de servir les fichiers téléchargés

app.use("/v1/supplier", supplierRoutes);
app.use("/v1/product", productRoutes);
app.use("/v1/product-image", productImageRoutes);
// app.use("/v1/role", roleRoutes);
// app.use("/v1/designation", designationRoutes);
app.use("/v1/product-category", productCategoryRoutes);
app.use("/v1/account", accountRoutes);
app.use("/v1/setting", settingRoutes);
app.use("/v1/sms", smsRouter);
app.use("/v1/audit-logs", getAuditLogs);
app.use('/v1/auth', authRoutes);

app.use(
  "/v1/role-permission",
  require("./routes/Personnel/hr/rolePermission/rolePermission.routes")
);
// app.use(
//   "/transaction",
//   require("./routes/accounting/transaction/transaction.routes")
// );
app.use(
  "/v1/permission",
  require("./routes/Personnel/hr/permission/permission.routes")
);
// app.use("/user", limiter, require("./routes/user/user.routes"));
app.use("/v1/role", require("./routes/Personnel/hr/role/role.routes"));
app.use(
  "/v1/designation",
  require("./routes/Personnel/hr/designation/designation.routes")
);
// app.use("/account", require("./routes/accounting/account/account.routes"));
// app.use("/setting", require("./routes/setting/setting.routes"));
// app.use("/v1/email", require("./routes/Personnel/email/email.routes"));
app.use(
  "/v1/department",
  require("./routes/Personnel/hr/department/department.routes")
);
app.use(
  "/v1/employment-status",
  require("./routes/Personnel/hr/employmentStatus/employmentStatus.routes")
);
app.use(
  "/v1/announcement",
  require("./routes/Personnel/hr/announcement/announcement.routes")
);
app.use(
  "/v1/leave-application",
  require("./routes/Personnel/hr/leaveApplication/leaveApplication.routes")
);
app.use(
  "/v1/attendance",
  require("./routes/Personnel/hr/attendance/attendance.routes")
);
app.use("/v1/payroll", require("./routes/Personnel/hr/payroll/payroll.routes"));
app.use(
  "/v1/education",
  require("./routes/Personnel/hr/education/education.routes")
);
app.use(
  "/v1/salaryHistory",
  require("./routes/Personnel/hr/salaryHistory/salaryHistory.routes")
);
app.use(
  "/v1/designationHistory",
  require("./routes/Personnel/hr/designationHistory/designationHistory.routes")
);
app.use(
  "/v1/dashboard",
  require("./routes/Personnel/dashboard/dashboard.routes")
);
app.use("/v1/shift", require("./routes/Personnel/hr/shift/shift.routes"));
app.use("/v1/files", require("./routes/Personnel/files/files.routes"));
app.use(
  "/v1/leave-policy",
  require("./routes/Personnel/hr/leavePolicy/leavePolicy.routes")
);
app.use(
  "/v1/weekly-holiday",
  require("./routes/Personnel/hr/weeklyHoliday/weeklyHoliday.routes")
);
app.use(
  "/v1/public-holiday",
  require("./routes/Personnel/hr/publicHoliday/publicHoliday.routes")
);
app.use("/v1/award", require("./routes/Personnel/hr/award/award.routes"));
app.use(
  "/v1/awardHistory",
  require("./routes/Personnel/hr/awardHistory/awardHistory.routes")
);

//project management routes
app.use(
  "/v1/project",
  require("./routes/Personnel/projectManagement/project/project.routes")
);
app.use(
  "/v1/milestone",
  require("./routes/Personnel/projectManagement/milestone/milestone.routes")
);
app.use(
  "/v1/tasks",
  require("./routes/Personnel/projectManagement/tasks/tasks.routes")
);
app.use(
  "/v1/assigned-task",
  require("./routes/Personnel/projectManagement/assignedTask/assignedTask.routes")
);
app.use(
  "/v1/project-team",
  require("./routes/Personnel/projectManagement/projectTeam/projectTeam.routes")
);
app.use(
  "/v1/task-status",
  require("./routes/Personnel/projectManagement/taskStatus/taskStatus.routes")
);
app.use(
  "/v1/task-priority",
  require("./routes/Personnel/projectManagement/priority/priority.routes")
);

module.exports = app;
