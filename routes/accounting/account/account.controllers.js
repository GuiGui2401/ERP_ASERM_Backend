const { getPagination } = require("../../../utils/query");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createSingleAccount = async (req, res) => {
  try {
    const createdAccount = await prisma.subAccount.create({
      data: {
        name: req.body.name,
        account: {
          connect: {
            id: Number(req.body.account_id),
          },
        },
      },
    });

    // Add audit log entry
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub), // L'ID de l'utilisateur qui a effectué l'action
        action: 'CREATE_SUB_ACCOUNT',
        entityId: createdAccount.id,
        entityType: 'subAccount',
        details: `Sub account ${createdAccount.name} created`,
      },
    });

    res.status(200).json(createdAccount);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

const getAllAccount = async (req, res) => {
  if (req.query.query === "tb") {
    const allAccount = await prisma.account.findMany({
      orderBy: [
        {
          id: "asc",
        },
      ],
      include: {
        subAccount: {
          include: {
            debit: {
              where: {
                status: true,
              },
            },
            credit: {
              where: {
                status: true,
              },
            },
          },
        },
      },
    });
    // some up all debit and credit amount from each subAccount and add it to every subAccount object
    let tb = {};
    const accountInfo = allAccount.map((account) => {
      return account.subAccount.map((subAccount) => {
        const totalDebit = subAccount.debit.reduce((acc, debit) => {
          return acc + debit.amount;
        }, 0);
        const totalCredit = subAccount.credit.reduce((acc, credit) => {
          return acc + credit.amount;
        }, 0);
        return (tb = {
          account: account.name,
          subAccount: subAccount.name,
          totalDebit,
          totalCredit,
          balance: totalDebit - totalCredit,
        });
      });
    });
    // transform accountInfo into an single array
    const trialBalance = accountInfo.flat();
    let debits = [];
    let credits = [];
    trialBalance.forEach((item) => {
      if (item.balance > 0) {
        debits.push(item);
      }
      if (item.balance < 0) {
        credits.push(item);
      }
    });
    //some up all debit and credit balance
    const totalDebit = debits.reduce((acc, debit) => {
      return acc + debit.balance;
    }, 0);
    const totalCredit = credits.reduce((acc, credit) => {
      return acc + credit.balance;
    }, 0);

    // check if total debit is equal to total credit
    let match = true;
    if (-totalDebit === totalCredit) {
      match = true;
    } else {
      match = false;
    }
    
    // Ajouter une entrée dans les logs
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_TRIAL_BALANCE',
        entityType: 'account',
        details: `Viewing accounts of all users`,
      },
    });

    // res.json(allAccount);
    res.json({ match, totalDebit, totalCredit, debits, credits });
    
  } else if (req.query.query === "bs") {
    const allAccount = await prisma.account.findMany({
      orderBy: [
        {
          id: "asc",
        },
      ],
      include: {
        subAccount: {
          include: {
            debit: {
              where: {
                status: true,
              },
            },
            credit: {
              where: {
                status: true,
              },
            },
          },
        },
      },
    });
    // some up all debit and credit amount from each subAccount and add it to every subAccount object
    let tb = {};
    const accountInfo = allAccount.map((account) => {
      return account.subAccount.map((subAccount) => {
        const totalDebit = subAccount.debit.reduce((acc, debit) => {
          return acc + debit.amount;
        }, 0);
        const totalCredit = subAccount.credit.reduce((acc, credit) => {
          return acc + credit.amount;
        }, 0);
        return (tb = {
          account: account.type,
          subAccount: subAccount.name,
          totalDebit,
          totalCredit,
          balance: totalDebit - totalCredit,
        });
      });
    });
    // transform accountInfo into an single array
    const balanceSheet = accountInfo.flat();
    let assets = [];
    let liabilities = [];
    let equity = [];
    balanceSheet.forEach((item) => {
      if (item.account === "Asset" && item.balance !== 0) {
        assets.push(item);
      }
      if (item.account === "Liability" && item.balance !== 0) {
        // convert negative balance to positive and vice versa
        liabilities.push({
          ...item,
          balance: -item.balance,
        });
      }
      if (item.account === "Owner's Equity" && item.balance !== 0) {
        // convert negative balance to positive and vice versa
        equity.push({
          ...item,
          balance: -item.balance,
        });
      }
    });
    //some up all asset, liability and equity balance
    const totalAsset = assets.reduce((acc, asset) => {
      return acc + asset.balance;
    }, 0);
    const totalLiability = liabilities.reduce((acc, liability) => {
      return acc + liability.balance;
    }, 0);
    const totalEquity = equity.reduce((acc, equity) => {
      return acc + equity.balance;
    }, 0);

    // check if total asset is equal to total liability and equity
    let match = true;
    if (-totalAsset === totalLiability + totalEquity) {
      match = true;
    } else {
      match = false;
    }

    // Ajouter une entrée dans les logs
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_BALANCE_SHEET',
        entityType: 'account',
        details: `Viewing accounts of all users`,
      },
    });

    res.json({
      match,
      totalAsset,
      totalLiability,
      totalEquity,
      assets,
      liabilities,
      equity,
    });
    
  } else if (req.query.query === "is") {
    const allAccount = await prisma.account.findMany({
      orderBy: [
        {
          id: "asc",
        },
      ],
      include: {
        subAccount: {
          include: {
            debit: {
              where: {
                status: true,
              },
            },
            credit: {
              where: {
                status: true,
              },
            },
          },
        },
      },
    });
    // some up all debit and credit amount from each subAccount and add it to every subAccount object
    let tb = {};
    const accountInfo = allAccount.map((account) => {
      return account.subAccount.map((subAccount) => {
        const totalDebit = subAccount.debit.reduce((acc, debit) => {
          return acc + debit.amount;
        }, 0);
        const totalCredit = subAccount.credit.reduce((acc, credit) => {
          return acc + credit.amount;
        }, 0);
        return (tb = {
          id: subAccount.id,
          account: account.name,
          subAccount: subAccount.name,
          totalDebit,
          totalCredit,
          balance: totalDebit - totalCredit,
        });
      });
    });
    // transform accountInfo into an single array
    const incomeStatement = accountInfo.flat();
    let revenue = [];
    let expense = [];
    incomeStatement.forEach((item) => {
      if (item.account === "Revenue" && item.balance !== 0) {
        // convert negative balance to positive and vice versa
        revenue.push({
          ...item,
          balance: -item.balance,
        });
      }
      if (item.account === "Expense" && item.balance !== 0) {
        // convert negative balance to positive and vice versa
        expense.push({
          ...item,
          balance: -item.balance,
        });
      }
    });

    //some up all revenue and expense balance
    const totalRevenue = revenue.reduce((acc, revenue) => {
      return acc + revenue.balance;
    }, 0);
    const totalExpense = expense.reduce((acc, expense) => {
      return acc + expense.balance;
    }, 0);

    // Ajouter une entrée dans les logs
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_INCOME_STATEMENT',
        entityType: 'account',
        details: `Viewing accounts of all users`,
      },
    });

    res.json({
      totalRevenue,
      totalExpense,
      profit: totalRevenue + totalExpense,
      revenue,
      expense,
    });
    
  } else if (req.query.query == "sa") {
    // subAccount
    try {
      const allSubAccount = await prisma.subAccount.findMany({
        orderBy: [
          {
            id: "asc",
          },
        ],
        include: {
          account: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      });

      // Ajouter une entrée dans les logs
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_SUB_ACCOUNTS',
        entityType: 'account',
        details: `Viewing accounts of all users`,
      },
    });

      res.json(allSubAccount);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  } else if (req.query.query == "ma") {
    // mainAccount
    try {
      const allSubAccount = await prisma.account.findMany({
        orderBy: [
          {
            id: "asc",
          },
        ],
      });

      // Ajouter une entrée dans les logs
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_MAIN_ACCOUNTS',
        entityType: 'account',
        details: `Viewing accounts of all users`,
      },
    });

      res.json(allSubAccount);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  } else {
    try {
      const allAccount = await prisma.account.findMany({
        orderBy: [
          {
            id: "asc",
          },
        ],
        include: {
          subAccount: {
            include: {
              debit: true,
              credit: true,
            },
          },
        },
      });

      // Ajouter une entrée dans les logs
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_ALL_ACCOUNTS',
        entityType: 'account',
        details: `Viewing accounts of all users`,
      },
    });

      res.json(allAccount);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  }
};

const getSingleAccount = async (req, res) => {
  try {
    const singleAccount = await prisma.subAccount.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        debit: true,
        credit: true,
      },
    });
    // calculate balance from total debit and credit
    const totalDebit = singleAccount.debit.reduce((acc, debit) => {
      return acc + debit.amount;
    }, 0);
    const totalCredit = singleAccount.credit.reduce((acc, credit) => {
      return acc + credit.amount;
    }, 0);
    const balance = totalDebit - totalCredit;
    singleAccount.balance = balance;

    // Ajouter une entrée dans les logs
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_SINGLE_SUBACCOUNT',
        entityId: singleAccount.id,
        entityType: 'subAccount',
        details: `Fetched subAccount ${singleAccount.name}`,
      },
    });

    res.json(singleAccount);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

const updateSingleAccount = async (req, res) => {
  try {
    // Récupérer les informations actuelles avant la mise à jour
    const oldAccount = await prisma.subAccount.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        account: true,
        credit: true,
        debit: true,
      },
    });

    // Mettre à jour l'entrée
    const updatedAccount = await prisma.subAccount.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        name: req.body.name,
        account: {
          connect: {
            id: Number(req.body.account_id),
          },
        },
      },
    });

    // Créer un message de détails avec les changements
    const changes = [];
    if (oldAccount.name !== updatedAccount.name) {
      changes.push(`Name: ${oldAccount.name} -> ${updatedAccount.name}`);
    }
    if (oldAccount.account_id !== Number(req.body.account_id)) {
      changes.push(`Account ID: ${oldAccount.account_id} -> ${req.body.account_id}`);
    }
    // Ajoute ici d'autres comparaisons si nécessaire pour les autres champs

    // Ajouter une entrée dans les logs
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'UPDATE_SUBACCOUNT',
        entityId: updatedAccount.id,
        entityType: 'subAccount',
        details: `Updated subAccount. Changes: ${changes.join(', ')}.`,
      },
    });

    res.json(updatedAccount);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};


const deleteSingleAccount = async (req, res) => {
  try {
    const deletedSubAccount = await prisma.subAccount.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status: req.body.status,
      },
    });

    // Ajouter une entrée dans les logs
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'DELETE_SUBACCOUNT',
        entityId: deletedSubAccount.id,
        entityType: 'subAccount',
        details: `Deleted subAccount ${deletedSubAccount.name}`,
      },
    });
    
    res.status(200).json(deletedSubAccount);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

module.exports = {
  createSingleAccount,
  getAllAccount,
  getSingleAccount,
  updateSingleAccount,
  deleteSingleAccount,
};
