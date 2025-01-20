const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();

const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const login = async (req, res) => {
  try {
    const allUser = await prisma.user.findMany();
    const user = allUser.find(
      (u) =>
        u.userName === req.body.userName &&
        bcrypt.compareSync(req.body.password, u.password)
    );
    // get permission from user roles
    const permissions = await prisma.role.findUnique({
      where: {
        ////  ph
        //name: user.role,
        id: user.roleId,
      },
      include: {
        rolePermission: {
          include: {
            permission: true,
          },
        },
      },
    });
    // store all permissions name to an array
    const permissionNames = permissions.rolePermission.map(
      (rp) => rp.permission.name
    );
    // console.log("permissionNames", permissionNames);
    if (user) {
      const token = jwt.sign(
        { sub: user.id, permissions: permissionNames },
        secret,
        {
          expiresIn: "24h",
        }
      );
      const { password, ...userWithoutPassword } = user;

      await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        details: `User ${user.userName} logged in successfully.`,
      },
    });

      return res.json({
        ...userWithoutPassword,
        token,
      });
    }

    await prisma.auditLog.create({
        data: {
          userId: null, // No user logged in
          action: 'LOGIN_FAILED',
          details: `Failed login attempt with username ${req.body.userName}.`,
        },
      });

    return res
      .status(400)
      .json({ message: "nom d'utilisateur ou mot de passe incorrect" });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const register = async (req, res) => {
  // try {
  //   const join_date = new Date(req.body.join_date).toISOString().split("T")[0];
  //   const leave_date = new Date(req.body.leave_date)
  //     .toISOString()
  //     .split("T")[0];

  //   const hash = await bcrypt.hash(req.body.password, saltRounds);
  //   const createUser = await prisma.user.create({
  //     data: {
  //       username: req.body.username,
  //       password: hash,
  //       role: req.body.role,
  //       email: req.body.email,
  //       salary: parseInt(req.body.salary),
  //       join_date: new Date(join_date),
  //       leave_date: new Date(leave_date),
  //       id_no: req.body.id_no,
  //       department: req.body.department,
  //       phone: req.body.phone,
  //       address: req.body.address,
  //       blood_group: req.body.blood_group,
  //       image: req.body.image,
  //       status: req.body.status,
  //       designation: {
  //         connect: {
  //           id: Number(req.body.designation_id),
  //         },
  //       },
  //     },
  //   });
  //   const { password, ...userWithoutPassword } = createUser;
  //   res.json(userWithoutPassword);
  // } catch (error) {
  //   res.status(500).json(error.message);
  // }
  try {
    const join_date = new Date(req.body.joinDate);
    const leave_date = new Date(req.body.leaveDate);

    const hash = await bcrypt.hash(req.body.password, saltRounds);
    const createUser = await prisma.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        password: hash,
        email: req.body.email,
        phone: req.body.phone,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country,
        joinDate: join_date,
        leaveDate: leave_date,
        employeeId: req.body.employeeId,
        bloodGroup: req.body.bloodGroup,
        image: req.body.image,
        employmentStatusId: req.body.employmentStatusId,
        departmentId: req.body.departmentId,
        roleId: req.body.roleId,
        shiftId: req.body.shiftId,
        leavePolicyId: req.body.leavePolicyId,
        weeklyHolidayId: req.body.weeklyHolidayId,
        designationHistory: {
          create: {
            designationId: req.body.designationId,
            startDate: new Date(req.body.designationStartDate),
            endDate: new Date(req.body.designationEndDate),
            comment: req.body.designationComment,
          },
        },
        salaryHistory: {
          create: {
            salary: req.body.salary,
            startDate: new Date(req.body.salaryStartDate),
            endDate: new Date(req.body.salaryEndDate),
            comment: req.body.salaryComment,
          },
        },
        educations: {
          create: req.body.educations.map((e) => {
            return {
              degree: e.degree,
              institution: e.institution,
              fieldOfStudy: e.fieldOfStudy,
              result: e.result,
              startDate: new Date(e.studyStartDate),
              endDate: new Date(e.studyEndDate),
            };
          }),
        },
      },
    });
    const { password, ...userWithoutPassword } = createUser;

    await prisma.auditLog.create({
      data: {
        userId: userWithoutPassword.id,
        action: 'REGISTER_USER',
        details: `New user registered with username ${createUser.userName}.`,
      },
    });

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// const getAllUser = async (req, res) => {
//   if (req.query.query === "all") {
//     try {
//       const allUser = await prisma.user.findMany({
//         include: {
//           saleInvoice: true,
//         },
//       });
//       res.json(
//         allUser
//           .map((u) => {
//             const { password, ...userWithoutPassword } = u;
//             return userWithoutPassword;
//           })
//           .sort((a, b) => a.id - b.id)
//       );
//     } catch (error) {
//       res.status(500).json(error.message);
//     }
//   } else if (req.query.status === "false") {
//     try {
//       const allUser = await prisma.user.findMany({
//         where: {
//           status: false,
//         },
//         include: {
//           saleInvoice: true,
//         },
//       });
//       res.json(
//         allUser
//           .map((u) => {
//             const { password, ...userWithoutPassword } = u;
//             return userWithoutPassword;
//           })
//           .sort((a, b) => a.id - b.id)
//       );
//     } catch (error) {
//       res.status(500).json(error.message);
//     }
//   } else {
//     try {
//       const allUser = await prisma.user.findMany({
//         where: {
//           status: true,
//         },
//         include: {
//           saleInvoice: true,
//         },
//       });
//       res.json(
//         allUser

//           .map((u) => {
//             const { password, ...userWithoutPassword } = u;
//             return userWithoutPassword;
//           })
//           .sort((a, b) => a.id - b.id)
//       );
//     } catch (error) {
//       res.status(500).json(error.message);
//     }
//   }
// };
/////////////////////////////////////////////////////////////////////
// const getSingleUser = async (req, res) => {
//   const singleUser = await prisma.user.findUnique({
//     where: {
//       id: Number(req.params.id),
//     },
//     include: {
//       saleInvoice: true,
//     },
//   });
//   const id = parseInt(req.params.id);

//   // only allow admins and owner to access other user records
//   // console.log(id !== req.auth.sub && !req.auth.permissions.includes("viewUser"));
//   if (id !== req.auth.sub && !req.auth.permissions.includes("viewUser")) {
//     return res
//       .status(401)
//       .json({ message: "Unauthorized. You are not an admin" });
//   }

//   if (!singleUser) return;
//   const { password, ...userWithoutPassword } = singleUser;
//   res.json(userWithoutPassword);
// };
// const updateSingleUser = async (req, res) => {
//   const id = parseInt(req.params.id);
//   // only allow admins and owner to edit other user records
//   // console.log(
//   //   id !== req.auth.sub && !req.auth.permissions.includes("updateUser")
//   // );
//   if (id !== req.auth.sub && !req.auth.permissions.includes("updateUser")) {
//     return res.status(401).json({
//       message: "Unauthorized. You can only edit your own record.",
//     });
//   }
//   try {
//     // admin can change all fields
//     if (req.auth.permissions.includes("updateUser")) {
//       const hash = await bcrypt.hash(req.body.password, saltRounds);
//       const join_date = new Date(req.body.join_date)
//         .toISOString()
//         .split("T")[0];
//       const leave_date = new Date(req.body.leave_date)
//         .toISOString()
//         .split("T")[0];
//       const updateUser = await prisma.user.update({
//         where: {
//           id: Number(req.params.id),
//         },
//         data: {
//           username: req.body.username,
//           password: hash,
//           role: req.body.role,
//           email: req.body.email,
//           salary: parseInt(req.body.salary),
//           join_date: new Date(join_date),
//           leave_date: new Date(leave_date),
//           id_no: req.body.id_no,
//           department: req.body.department,
//           phone: req.body.phone,
//           address: req.body.address,
//           blood_group: req.body.blood_group,
//           image: req.body.image,
//           status: req.body.status,
//           designation: {
//             connect: {
//               id: Number(req.body.designation_id),
//             },
//           },
//         },
//       });
//       const { password, ...userWithoutPassword } = updateUser;
//       res.json(userWithoutPassword);
//     } else {
//       // owner can change only password
//       const hash = await bcrypt.hash(req.body.password, saltRounds);
//       const updateUser = await prisma.user.update({
//         where: {
//           id: Number(req.params.id),
//         },
//         data: {
//           password: hash,
//         },
//       });
//       const { password, ...userWithoutPassword } = updateUser;
//       res.json(userWithoutPassword);
//     }
//   } catch (error) {
//     res.status(500).json(error.message);
//   }
// };

const getAllUser = async (req, res) => {
  if (req.query.query === "all") {
    try {
      const allUser = await prisma.user.findMany({
        include: {
          designationHistory: {
            include: {
              designation: true,
            },
          },
          salaryHistory: true,
          educations: true,
          employmentStatus: true,
          department: true,
          role: true,
          shift: true,
          leavePolicy: true,
          weeklyHoliday: true,
          awardHistory: true,
          saleInvoice: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'GET_ALL_USERS',
          entityType: 'user',
          details: 'Fetched all users.',
        },
      });

      return res.status(200).json(
        allUser
          .map((u) => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
          })
          .sort((a, b) => a.id - b.id)
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } else if (req.query.status === "false") {
    try {
      const allUser = await prisma.user.findMany({
        where: {
          status: false,
        },
        include: {
          designationHistory: {
            include: {
              designation: true,
            },
          },
          salaryHistory: true,
          educations: true,
          employmentStatus: true,
          department: true,
          role: true,
          shift: true,
          leavePolicy: true,
          weeklyHoliday: true,
          awardHistory: true,
          saleInvoice: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'GET_USERS_BY_STATUS_FALSE',
          entityType: 'user',
          details: 'Fetched users with status false.',
        },
      });

      return res.status(200).json(
        allUser
          .map((u) => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
          })
          .sort((a, b) => a.id - b.id)
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } else {
    try {
      const allUser = await prisma.user.findMany({
        where: {
          status: true,
        },
        include: {
          designationHistory: {
            include: {
              designation: true,
            },
          },
          salaryHistory: true,
          educations: true,
          employmentStatus: true,
          department: true,
          role: true,
          shift: true,
          leavePolicy: true,
          weeklyHoliday: true,
          awardHistory: true,
          saleInvoice: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'GET_USERS_BY_STATUS_TRUE',
          entityType: 'user',
          details: 'Fetched users with status true.',
        },
      });

      return res.status(200).json(
        allUser
          .map((u) => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
          })
          .sort((a, b) => a.id - b.id)
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

const getSingleUser = async (req, res) => {
  const singleUser = await prisma.user.findUnique({
    where: {
      id: Number(req.params.id),
    },
    include: {
      designationHistory: {
        include: {
          designation: true,
        },
      },
      salaryHistory: true,
      educations: true,
      employmentStatus: true,
      department: true,
      role: true,
      shift: true,
      leavePolicy: true,
      weeklyHoliday: true,
      awardHistory: {
        include: {
          award: true,
        },
      },
      leaveApplication: {
        orderBy: {
          id: "desc",
        },
        take: 5,
      },
      attendance: {
        orderBy: {
          id: "desc",
        },
        take: 1,
      },
    },
    saleInvoice: true,
  });

  // calculate paid and unpaid leave days for the user for the current year
  const leaveDays = await prisma.leaveApplication.findMany({
    where: {
      userId: Number(req.params.id),
      status: "ACCEPTED",
      acceptLeaveFrom: {
        gte: new Date(new Date().getFullYear(), 0, 1),
      },
      acceptLeaveTo: {
        lte: new Date(new Date().getFullYear(), 11, 31),
      },
    },
  });
  const paidLeaveDays = leaveDays
    .filter((l) => l.leaveType === "PAID")
    .reduce((acc, item) => {
      return acc + item.leaveDuration;
    }, 0);
  const unpaidLeaveDays = leaveDays
    .filter((l) => l.leaveType === "UNPAID")
    .reduce((acc, item) => {
      return acc + item.leaveDuration;
    }, 0);

  singleUser.paidLeaveDays = paidLeaveDays;
  singleUser.unpaidLeaveDays = unpaidLeaveDays;
  singleUser.leftPaidLeaveDays =
    singleUser.leavePolicy.paidLeaveCount - paidLeaveDays;
  singleUser.leftUnpaidLeaveDays =
    singleUser.leavePolicy.unpaidLeaveCount - unpaidLeaveDays;
  const id = parseInt(req.params.id);
  // only allow admins and owner to access other user records. use truth table to understand the logic
  if (
    id !== req.auth.sub &&
    !req.auth.permissions.includes("readSingle-user")
  ) {
    return res
      .status(401)
      .json({ message: "Unauthorized. You are not an admin" });
  }

  if (!singleUser) return;
  const { password, ...userWithoutPassword } = singleUser;

  await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_SINGLE_USER',
        entityType: 'user',
        details: `Fetched single user with ID ${id}.`,
      },
    });
    
  return res.status(200).json(userWithoutPassword);
};

const updateSingleUser = async (req, res) => {
  const id = parseInt(req.params.id);
  // only allow admins and owner to edit other user records. use truth table to understand the logic

  if (id !== req.auth.sub && !req.auth.permissions.includes("update-user")) {
    return res.status(401).json({
      message: "Unauthorized. You can only edit your own record.",
    });
  }
  try {
    // admin can change all fields
    if (req.auth.permissions.includes("update-user")) {
      const hash = await bcrypt.hash(req.body.password, saltRounds);
      const join_date = new Date(req.body.joinDate);
      const leave_date = new Date(req.body.leaveDate);
      const updateUser = await prisma.user.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          userName: req.body.userName,
          password: hash,
          email: req.body.email,
          phone: req.body.phone,
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zipCode,
          country: req.body.country,
          joinDate: join_date,
          leaveDate: leave_date,
          employeeId: req.body.employeeId,
          bloodGroup: req.body.bloodGroup,
          image: req.body.image,
          employmentStatusId: req.body.employmentStatusId,
          departmentId: req.body.departmentId,
          roleId: req.body.roleId,
          shiftId: req.body.shiftId,
          leavePolicyId: req.body.leavePolicyId,
          weeklyHolidayId: req.body.weeklyHolidayId,
        },
      });
      const { password, ...userWithoutPassword } = updateUser;

      await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'UPDATE_USER',
        entityType: 'user',
        details: `Updated user with ID ${id}.`,
      },
    });

      return res.status(200).json(userWithoutPassword);
    } else {
      // owner can change only password
      const hash = await bcrypt.hash(req.body.password, saltRounds);
      const updateUser = await prisma.user.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
          password: hash,
        },
      });
      const { password, ...userWithoutPassword } = updateUser;

      await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'UPDATE_USER',
        entityType: 'user',
        details: `Updated user with ID ${id}.`,
      },
    });

      return res.status(200).json(userWithoutPassword);
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

const deleteSingleUser = async (req, res) => {
  // const id = parseInt(req.params.id);
  // only allow admins to delete other user records
  if (!req.auth.permissions.includes("deleteUser")) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Only admin can delete." });
  }
  try {
    const deleteUser = await prisma.user.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status: req.body.status,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'DELETE_USER',
        entityType: 'user',
        details: `Deleted user with ID ${req.params.id}.`,
      },
    });
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = {
  login,
  register,
  getAllUser,
  getSingleUser,
  updateSingleUser,
  deleteSingleUser,
};
