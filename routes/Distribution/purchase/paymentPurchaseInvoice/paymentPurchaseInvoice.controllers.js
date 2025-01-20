const { getPagination } = require("../../../../utils/query");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// create a transaction
// pay amount against purchase invoice
// pay amount against supplier : ALL IN ONE TRANSACTION DB QUERY
const createPaymentPurchaseInvoice = async (req, res) => {
  try {
    // convert all incoming data to a specific format.
    const date = new Date(req.body.date).toISOString().split("T")[0];
    // paid amount against purchase invoice using a transaction
    const transaction1 = await prisma.transaction.create({
      data: {
        date: new Date(date),
        debit_id: 5,
        credit_id: 1,
        amount: parseFloat(req.body.amount),
        particulars: `Due pay of Purchase Invoice #${req.body.purchase_invoice_no}`,
        type: "purchase",
        related_id: parseInt(req.body.purchase_invoice_no),
      },
    });
    // discount earned using a transaction
    let transaction2;
    if (req.body.discount > 0) {
      transaction2 = await prisma.transaction.create({
        data: {
          date: new Date(date),
          debit_id: 5,
          credit_id: 13,
          amount: parseFloat(req.body.discount),
          particulars: `Discount earned of Purchase Invoice #${req.body.purchase_invoice_no}`,
          type: "purchase",
          related_id: parseInt(req.body.purchase_invoice_no),
        },
      });
    }

    // Log the create payment purchase invoice action
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'CREATE_PAYMENT_PURCHASE_INVOICE',
        details: `Created payment for purchase invoice #${req.body.purchase_invoice_no} with amount ${req.body.amount} and discount ${req.body.discount}`,
      },
    });

    res.status(200).json({ transaction1, transaction2 });
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

const getAllPaymentPurchaseInvoice = async (req, res) => {
  if (req.query.query === "all") {
    try {
      const allPaymentPurchaseInvoice = await prisma.transaction.findMany({
        where: {
          type: "purchase",
        },
        orderBy: {
          id: "desc",
        },
      });

      // Log the get all payment purchase invoices action
      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'GET_ALL_PAYMENT_PURCHASE_INVOICES',
          details: 'Retrieved all payment purchase invoices',
        },
      });

      res.json(allPaymentPurchaseInvoice);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  } else if (req.query.query === "info") {
    const aggregations = await prisma.transaction.aggregate({
      where: {
        type: "purchase",
      },
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    // Log the get payment purchase invoices info action
      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'GET_PAYMENT_PURCHASE_INVOICES_INFO',
          details: 'Retrieved payment purchase invoices info',
        },
      });

    res.json(aggregations);
  } else {
    const { skip, limit } = getPagination(req.query);
    try {
      const allPaymentPurchaseInvoice = await prisma.transaction.findMany({
        where: {
          type: "purchase",
        },
        orderBy: {
          id: "desc",
        },
        skip: Number(skip),
        take: Number(limit),
      });

      // Log the get paginated payment purchase invoices action
      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'GET_PAGINATED_PAYMENT_PURCHASE_INVOICES',
          details: `Retrieved paginated payment purchase invoices with skip ${skip} and limit ${limit}`,
        },
      });
      
      res.json(allPaymentPurchaseInvoice);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  }
};

const getSinglePaymentPurchaseInvoice = async (req, res) => {
  try {
    const singleSupplier = await prisma.supplier.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        purchaseInvoice: true,
      },
    });
    res.json(singleSupplier);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

// const updateSinglePaymentPurchaseInvoice = async (req, res) => {
//   try {
//     const updatedSupplier = await prisma.supplier.update({
//       where: {
//         id: Number(req.params.id),
//       },
//       data: {
//         name: req.body.name,
//         phone: req.body.phone,
//         address: req.body.address,
//         due_amount: Number(req.body.due_amount),
//       },
//     });
//     res.json(updatedSupplier);
//   } catch (error) {
//     res.status(400).json(error.message);
//     console.log(error.message);
//   }
// };

// const deleteSinglePaymentPurchaseInvoice = async (req, res) => {
//   try {
//     const deletedSupplier = await prisma.supplier.delete({
//       where: {
//         id: Number(req.params.id),
//       },
//     });
//     res.json(deletedSupplier);
//   } catch (error) {
//     res.status(400).json(error.message);
//     console.log(error.message);
//   }
// };

module.exports = {
  createPaymentPurchaseInvoice,
  getAllPaymentPurchaseInvoice,
  getSinglePaymentPurchaseInvoice,
  // updateSinglePaymentPurchaseInvoice,
  // deleteSinglePaymentPurchaseInvoice,
};
