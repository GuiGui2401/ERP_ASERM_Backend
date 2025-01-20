const { getPagination } = require("../../../../utils/query");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createSinglePromiseSaleInvoice = async (req, res) => {
  try {
    let totalPromiseSalePrice = 0;
    const { dueDate, reminderDate  } = req.body; // Récupérer les nouvelles valeurs

    // Calculer le prix total des produits dans la promesse de vente
    req.body.promiseSaleInvoiceProduct.forEach((item) => {
      totalPromiseSalePrice +=
        parseFloat(item.product_sale_price) * parseFloat(item.product_quantity);
    });

    // Initialiser les variables pour le nom et le téléphone du client
    let customer_name = req.body.customer_name;
    let customer_phone = req.body.customer_phone;
    let customer_address = req.body.customer_address;
    let companyName = req.body.companyName;

    // Vérifier si un customer_id est fourni
    if (req.body.customer_id) {
      // Récupérer les informations du client à partir de la base de données
      const customer = await prisma.customer.findUnique({
        where: {
          id: Number(req.body.customer_id),
        },
        select: {
          name: true,
          phone: true,
          nameresponsable: true,
          quartier: true,
          ville: true
        },
      });

      if (customer) {
        customer_name = customer.nameresponsable || '';
        customer_phone = customer.phone || '';
        customer_address = `${customer.quartier || ''}` + ' ' + `${customer.ville || ''}`;
        companyName = `${customer.name || ''}`;
      } else {
        // Si le client n'existe pas, renvoyer une erreur
        return res.status(404).json({ error: 'Client non trouvé' });
      }
    }

    const date = new Date(req.body.date);

    // Création de la promesse de vente
    const createdPromise = await prisma.salePromise.create({
      data: {
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,  // Enregistrer la date d'échéance
        reminderDate: reminderDate ? new Date(reminderDate) : null,  // Enregistrer la date de rappel
        companyName: companyName,  // Enregistrer le nom de l'entreprise
        customer_address: customer_address || null, // Enregistrer l'adresse du client
        total_amount: totalPromiseSalePrice,
        discount: parseFloat(req.body.discount),
        customer_name: customer_name,
        customer_phone: customer_phone,
        ...(req.body.customer_id ? {
          user: {
            connect: {
              id: Number(req.body.customer_id),
            },
          },
        } : {}),
        user: {
          connect: {
            id: Number(req.body.user_id),
          },
        },
        note: req.body.note,
        salePromiseProduct: {
          create: req.body.promiseSaleInvoiceProduct.map((product) => ({
            product: {
              connect: {
                id: Number(product.product_id),
              },
            },
            product_quantity: Number(product.product_quantity),
            product_sale_price: parseFloat(product.product_sale_price),
          })),
        },
      },
    });

    res.json({
      createdPromise,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log(error.message);
  }
};




const getAllPromiseSaleInvoice = async (req, res) => {
  if (req.query.query === "info") {
    const aggregations = await prisma.salePromise.aggregate({
      _count: { id: true },
      _sum: {
        total_amount: true,
        discount: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_ALL_PROMISE_SALE_INFO',
        details: `Retrieved aggregations for promise sales.`,
      },
    });

    res.json(aggregations);
  } else {
    const { skip, limit } = getPagination(req.query);

    try {
      let aggregations, salePromises;

      const startDate = new Date(req.query.startdate).toISOString();
      const endDate = new Date(req.query.enddate).toISOString();

      if (req.query.user) {
        if (req.query.count) {
          [aggregations, salePromises] = await prisma.$transaction([
            prisma.salePromise.aggregate({
              _count: { id: true },
              _sum: {
                total_amount: true,
                discount: true,
              },
              where: {
                date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
                user_id: Number(req.query.user),
              },
            }),
            prisma.salePromise.findMany({
              orderBy: [{ id: "desc" }],
              skip: Number(skip),
              take: Number(limit),
              include: {
                salePromiseProduct: { include: { product: true } },
                user: { select: { id: true, userName: true } },
              },
              where: {
                date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
                user_id: Number(req.query.user),
              },
            }),
          ]);
        } else {
          [aggregations, salePromises] = await prisma.$transaction([
            prisma.salePromise.aggregate({
              _count: { id: true },
              _sum: {
                total_amount: true,
                discount: true,
              },
              where: {
                date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
                user_id: Number(req.query.user),
              },
            }),
            prisma.salePromise.findMany({
              orderBy: [{ id: "desc" }],
              include: {
                salePromiseProduct: { include: { product: true } },
                user: { select: { id: true, userName: true } },
              },
              where: {
                date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
                user_id: Number(req.query.user),
              },
            }),
          ]);
        }
      } else {
        if (req.query.count) {
          [aggregations, salePromises] = await prisma.$transaction([
            prisma.salePromise.aggregate({
              _count: { id: true },
              _sum: {
                total_amount: true,
                discount: true,
              },
              where: {
                date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
            }),
            prisma.salePromise.findMany({
              orderBy: [{ id: "desc" }],
              skip: Number(skip),
              take: Number(limit),
              include: {
                salePromiseProduct: { include: { product: true } },
                user: { select: { id: true, userName: true } },
              },
              where: {
                date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
            }),
          ]);
        } else {
          [aggregations, salePromises] = await prisma.$transaction([
            prisma.salePromise.aggregate({
              _count: { id: true },
              _sum: {
                total_amount: true,
                discount: true,
              },
              where: {
                date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
            }),
            prisma.salePromise.findMany({
              orderBy: [{ id: "desc" }],
              include: {
                salePromiseProduct: { include: { product: true } },
                user: { select: { id: true, userName: true } },
              },
              where: {
                date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
            }),
          ]);
        }
      }

      const allPromiseSales = salePromises.map((item) => {
        const discount = item.discount || 0;
        return { ...item, discount };
      });

      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'GET_ALL_PROMISE_SALES',
          details: `Retrieved all promise sales. Number of Sales: ${salePromises.length}.`,
        },
      });

      res.json({
        aggregations,
        allPromiseSales,
      });
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  }
};





const getSinglePromiseSaleInvoice = async (req, res) => {
  try {
    const singlePromiseSaleInvoice = await prisma.promiseSaleInvoice.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        promiseSaleProduct: { include: { product: true } },
        client: true,
        user: { select: { id: true, userName: true } },
      },
    });

    // Fetch transactions and returns related to the promise sale invoice
    const transactions = await prisma.transaction.findMany({
      where: {
        related_id: Number(req.params.id),
        OR: [{ type: "promise_sale" }, { type: "promise_sale_return" }],
      },
    });

    // Calculating total paid and due amounts
    const totalPaidAmount = transactions.reduce((acc, item) => acc + item.amount, 0);
    const totalDiscountAmount = transactions.filter(t => t.debit_id === 14).reduce((acc, item) => acc + item.amount, 0);

    // Check if the promise sale invoice is fully paid
    const dueAmount = singlePromiseSaleInvoice.total_amount - singlePromiseSaleInvoice.discount - totalPaidAmount;
    let status = dueAmount === 0 ? "PAYÉ" : "INPAYÉ";

    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_SINGLE_PROMISE_SALE_INVOICE',
        details: `Retrieved Promise Sale Invoice #${singlePromiseSaleInvoice.id}.`,
      },
    });

    res.json({
      status,
      totalPaidAmount,
      dueAmount,
      singlePromiseSaleInvoice,
      transactions,
    });
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

const getReminderNotifications = async (req, res) => {
  const today = new Date();
  
  try {
    const reminders = await prisma.salePromise.findMany({
      where: {
        reminderDate: {
          lte: today // Toutes les promesses avec une reminderDate passée ou égale à aujourd'hui
        }
      },
      include: {
        user: true, // Si besoin d'inclure les infos utilisateur
      }
    });
    
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des notifications" });
  }
};




module.exports = {
  createSinglePromiseSaleInvoice,
  getAllPromiseSaleInvoice,
  getSinglePromiseSaleInvoice,
  getReminderNotifications,
};
