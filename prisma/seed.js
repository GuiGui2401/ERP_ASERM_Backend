const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// const endpoints = [
//   "paymentPurchaseInvoice",
//   "paymentSaleInvoice",
//   "returnSaleInvoice",
//   "purchaseInvoice",
//   "returnPurchaseInvoice",
//   "rolePermission",
//   "saleInvoice",
//   "transaction",
//   "permission",
//   "dashboard",
//   "customer",
//   "supplier",
//   "product",
//   "user",
//   "role",
//   "designation",
//   "productCategory",
//   "account",
//   "setting",
// ];

// const permissionTypes = ["create", "read", "update", "delete"];

// create permissions for each endpoint by combining permission type and endpoint name
// const permissions = endpoints.reduce((acc, cur) => {
//   const permission = permissionTypes.map((type) => {
//     return `${type}-${cur}`;
//   });
//   return [...acc, ...permission];
// }, []);

// console.log("permissions", permissions, permissions.length);

const permissions = [
  "createProduct",
  "viewProduct",
  "updateProduct",
  "deleteProduct",

  "createCustomer",
  "viewCustomer",
  "updateCustomer",
  "deleteCustomer",

  "createSupplier",
  "viewSupplier",
  "updateSupplier",
  "deleteSupplier",
  
  "createTransaction",
  "viewTransaction",
  "updateTransaction",
  "deleteTransaction",
  "readAll-transaction",
  "readSingle-transaction",
  "create-transaction",

  "createSaleInvoice",
  "viewSaleInvoice",
  "updateSaleInvoice",
  "deleteSaleInvoice",

  "createPurchaseInvoice",
  "viewPurchaseInvoice",
  "updatePurchaseInvoice",
  "deletePurchaseInvoice",

  "createPaymentPurchaseInvoice",
  "viewPaymentPurchaseInvoice",
  "updatePaymentPurchaseInvoice",
  "deletePaymentPurchaseInvoice",

  "createPaymentSaleInvoice",
  "viewPaymentSaleInvoice",
  "updatePaymentSaleInvoice",
  "deletePaymentSaleInvoice",

  "create-role",
  "readAll-role",
  "readSingle-role",
  "update-role",
  "delete-role",

  "create-rolePermission",
  "readAll-rolePermission",
  "readSingle-rolePermission",
  "update-rolePermission",
  "delete-rolePermission",

  "readAll-permission",

  "createUser",
  "viewUser",
  "updateUser",
  "deleteUser",
  "create-user",
  "readSingle-user",
  "readAll-user",

  "viewDashboardDistribution",

  "create-designation",
  "readAll-designation",
  "readSingle-designation",
  "update-designation",
  "delete-designation",

  "createProductCategory",
  "viewProductCategory",
  "updateProductCategory",
  "deleteProductCategory",

  "createReturnPurchaseInvoice",
  "viewReturnPurchaseInvoice",
  "updateReturnPurchaseInvoice",
  "deleteReturnPurchaseInvoice",

  "createReturnSaleInvoice",
  "viewReturnSaleInvoice",
  "updateReturnSaleInvoice",
  "deleteReturnSaleInvoice",

  "updateSetting",
  "viewSetting",
  "readAll-setting",

  "ReadDashboardHR",

  "create-assignedTask",
  "readAll-assignedTask",
  "readSingle-assignedTask",
  "update-assignedTask",
  "delete-assignedTask",

  "create-award",
  "readAll-award",
  "update-award",
  "delete-award",
  "readSingle-award",

  "create-awardHistory",
  "readAll-awardHistory",
  "readSingle-awardHistory",
  "update-awardHistory",
  "delete-awardHistory",

  "CreateFile",
  "ViewFile",
  "UpdateFile",
  "DeleteFile",

  "create-leavePolicy",
  "readAll-leavePolicy",
  "readSingle-leavePolicy",
  "update-leavePolicy",
  "delete-leavePolicy",

  "create-weeklyHoliday",
  "readAll-weeklyHoliday",
  "readSingle-weeklyHoliday",
  "update-weeklyHoliday",
  "delete-weeklyHoliday",

  "create-publicHoliday",
  "readAll-publicHoliday",
  "readSingle-publicHoliday",
  "update-publicHoliday",
  "delete-publicHoliday",

  "create-project",
  "readAll-project",
  "readSingle-project",
  "update-project",
  "delete-project",

  "create-task",
  "readAll-task",
  "readSingle-task",
  "update-task",
  "delete-task",

  "create-projectTeam",
  "readAll-projectTeam",
  "readSingle-projectTeam",
  "update-projectTeam",
  "delete-projectTeam",

  "CreateTaskDependency",
  "ViewTaskDependency",
  "UpdateTaskDependency",
  "DeleteTaskDependency",

  "create-taskStatus",
  "readAll-taskStatus",
  "readSingle-taskStatus",
  "update-taskStatus",
  "delete-taskStatus",

  "CreateTaskTime",
  "ViewTaskTime",
  "UpdateTaskTime",
  "DeleteTaskTime",

  "create-priority",
  "readAll-priority",
  "readSingle-priority",
  "update-priority",
  "delete-priority",

  "CreateAccount",
  "ViewAccount",
  "UpdateAccount",
  "DeleteAccount",
  "readAll-account",
  "readSingle-account",
  "update-accoun",

  "CreateAttendance",
  "ViewAttendance",
  "UpdateAttendance",
  "DeleteAttendance",
  "getAllAttendance",
  "getSingleAttendance",
  "getAttendanceByUserId",
  "getLastAttendanceByUserId",
  "readAll-attendance",
  "readSingle-attendance",
  "create-attendance",

  "create-department",
  "readAll-department",
  "update-department",
  "delete-department",
  "readSingle-department",

  "create-education",
  "readAll-education",
  "update-education",
  "delete-education",
  "readSingle-education",

  "create-payroll",
  "readAll-payroll",
  "readSingle-payroll",
  "update-payroll",

  "update-leaveApplication",
  "create-leaveApplication",
  "readAll-leaveApplication",
  "readSingle-leaveApplication",
  "readByUserId-leaveApplication",

  "create-shift",
  "readAll-shift",
  "readSingle-shift",
  "update-shift",
  "delete-shift",

  "create-employmentStatus",
  "readAll-employmentStatus",
  "readSingle-employmentStatus",
  "delete-employmentStatus",
  "update-employmentStatus",

  "create-announcement",
  "readAll-announcement",
  "readSingle-announcement",
  "update-announcement",
  "delete-announcement",

  "CreateSalaryHistory",
  "ViewSalaryHistory",
  "UpdateSalaryHistory",
  "DeleteSalaryHistory",
  "create-salaryHistory",
  "update-salaryHistory",

  "create-designationHistory",
  "readAll-designationHistory",
  "readSingle-designationHistory",
  "update-designationHistory",
  "delete-designationHistory",

  "CreateEmail",
  "ViewEmail",
  "UpdateEmail",
  "DeleteEmail",

  "create-milestone",
  "readAll-milestone",
  "readSingle-milestone",
  "update-milestone",
  "delete-milestone",

  "readAll-Report",
  "delete-Report",
  "readSingle-Report"
];

const roles = ["admin", "staff"];

const account = [
  { name: "Asset", type: "Asset" },
  { name: "Liability", type: "Liability" },
  { name: "Capital", type: "Owner's Equity" },
  { name: "Withdrawal", type: "Owner's Equity" },
  { name: "Revenue", type: "Owner's Equity" },
  { name: "Expense", type: "Owner's Equity" },
];

const subAccount = [
  { account_id: 1, name: "Cash" }, //1
  { account_id: 1, name: "Bank" }, //2
  { account_id: 1, name: "Inventory" }, //3
  { account_id: 1, name: "Accounts Receivable" }, //4
  { account_id: 2, name: "Accounts Payable" }, //5
  { account_id: 3, name: "Capital" }, //6
  { account_id: 4, name: "Withdrawal" }, //7
  { account_id: 5, name: "Sales" }, //8
  { account_id: 6, name: "Cost of Sales" }, //9
  { account_id: 6, name: "Salary" }, //10
  { account_id: 6, name: "Rent" }, //11
  { account_id: 6, name: "Utilities" }, //12
  { account_id: 5, name: "Discount Earned" }, //13
  { account_id: 6, name: "Discount Given" }, //14
];

const settings = {
  company_name: "ASERMPHARMA",
  address: "1er étage, ancien immeuble ECOBANK Tsinga, Yaoundé 1er- Cameroun",
  phone: "+237 659 404 884",
  email: "secretariat@asermpharma.com",
  website: "https://www.asermpharma.com/",
  footer: "©2022 VPMC-SANTE, TOUS DROITS RÉSERVÉS",
  tag_line: "Mon Slogan",
};

const department = [
  { name: "IT" },
  { name: "HR" },
  { name: "Ventes" },
  { name: "Marketing" },
  { name: "Finance" },
  { name: "Sanitaire" },
];

const designation = [{ name: "CEO" }, { name: "HR Manager" }];

const employmentStatus = [
  { name: "Intern", colourValue: "#00FF00", description: "Intern" },
  { name: "Permenent", colourValue: "#FF0000", description: "Permenent" },
  { name: "Staff", colourValue: "#FFFF00", description: "Staff" },
  { name: "Terminated", colourValue: "#00FFFF", description: "Terminated" },
];

const shifts = [
  {
    name: "Morning",
    startTime: "2024-01-01T08:00:00.000Z",
    endTime: "2024-01-01T16:00:00.000Z",
    workHour: 8,
  },
  {
    name: "Evening",
    startTime: "2024-01-01T16:00:00.000Z",
    endTime: "2024-01-01T00:00:00.000Z",
    workHour: 8,
  },
  {
    name: "Night",
    startTime: "2024-01-01T00:00:00.000Z",
    endTime: "2024-01-01T08:00:00.000Z",
    workHour: 8,
  },
];

const leavePolicy = [
  {
    name: "Policy 8-12",
    paidLeaveCount: 8,
    unpaidLeaveCount: 12,
  },
  {
    name: "Policy 12-15",
    paidLeaveCount: 12,
    unpaidLeaveCount: 15,
  },
  {
    name: "Policy 15-15",
    paidLeaveCount: 15,
    unpaidLeaveCount: 15,
  },
];

const weeklyHoliday = [
  {
    name: "Saturday-Thursday",
    startDay: "Saturday",
    endDay: "Thursday",
  },
  {
    name: "Sunday-Friday",
    startDay: "Sunday",
    endDay: "Friday",
  },
];

/// Ligne Ajouter dans le seeder
const year = new Date().getFullYear();
const publicHoliday = [
  {
    name: "Nouvelle Année",
    date: new Date(year, 0, 1),
  },
  {
    name: "Fête Nationale",
    date: new Date(year, 4, 20),
  },
  {
    name: "Noël",
    date: new Date(year, 11, 25),
  },
];

const award = [
  {
    name: "Employé du Mois",
    description: "Employé qui a obtenu de bons résultats au cours du mois",
  },
  {
    name: "Employé de L'année",
    description: "Employé qui a obtenu de bons résultats au cours de l’année",
  },
];

const priority = [
  {
    name: "Low",
  },
  {
    name: "Medium",
  },
  {
    name: "High",
  },
];

async function main() {
  await prisma.department.createMany({
    data: department,
  });
  await prisma.designation.createMany({
    data: designation,
  });
  await prisma.employmentStatus.createMany({
    data: employmentStatus,
  });
  await prisma.shift.createMany({
    data: shifts,
  });

  await prisma.leavePolicy.createMany({
    data: leavePolicy,
  });

  await prisma.weeklyHoliday.createMany({
    data: weeklyHoliday,
  });

  await prisma.publicHoliday.createMany({
    data: publicHoliday,
  });

  await prisma.award.createMany({
    data: award,
  });

  await prisma.priority.createMany({
    data: priority,
  });

  await prisma.role.createMany({
    data: roles.map((role) => {
      return {
        name: role,
      };
    }),
  });
  await prisma.permission.createMany({
    data: permissions.map((permission) => {
      return {
        name: permission,
      };
    }),
  });
  for (let i = 1; i <= permissions.length; i++) {
    await prisma.rolePermission.create({
      data: {
        role: {
          connect: {
            id: 1,
          },
        },
        permission: {
          connect: {
            id: i,
          },
        },
      },
    });
  }
  const adminHash = await bcrypt.hash("123abc9z", saltRounds);
  await prisma.user.create({
    data: {
      firstName: "GuiGui",
      lastName: "Jo",
      userName: "GuiGui2401",
      password: adminHash,
      employmentStatusId: 1,
      departmentId: 1,
      roleId: 1,
      shiftId: 1,
      leavePolicyId: 1,
      weeklyHolidayId: 1,
    },
  });

  // Hash du mot de passe avec bcrypt
  const staffHash = await bcrypt.hash("staff", saltRounds);

  // Création de l'utilisateur staff dans la base de données
  await prisma.user.create({
    data: {
      firstName: "Staff",
      lastName: "Test",
      userName: "staff",
      password: staffHash,
      employmentStatusId: 3,
      departmentId: 1,
      roleId: 2,
      shiftId: 1,
      leavePolicyId: 1,
      weeklyHolidayId: 1,
    },
  });

  await prisma.account.createMany({
    data: account,
  });
  await prisma.subAccount.createMany({
    data: subAccount,
  });
  await prisma.appSetting.create({
    data: settings,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
