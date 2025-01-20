const { getPagination } = require("../../../../utils/query");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();

const PORT = process.env.PORT || 5002;
const HOST = process.env.HOST;

const createSingleProduct = async (req, res) => {
  if (req.query.query === "deletemany") {
    try {
      // delete many product at once
      const deletedProduct = await prisma.product.deleteMany({
        where: {
          id: {
            in: req.body.map((id) => Number(id)),
          },
        },
      });

      // Log the delete action
      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'DELETE_MANY_PRODUCT',
          details: `Deleted products with IDs: ${req.body.join(", ")}`,
        },
      });

      res.json(deletedProduct);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  } else if (req.query.query === "createmany") {
    try {
      // sum all total purchase price
      const totalPurchasePrice = req.body.reduce((acc, cur) => {
        return acc + cur.quantity * cur.purchase_price;
      }, 0);
      // convert incoming data to specific format
      const data = req.body.map((item) => {
        return {
          name: item.name,
          quantity: parseInt(item.quantity),
          purchase_price: parseFloat(item.purchase_price),
          sale_price: parseFloat(item.sale_price),
          product_category_id: parseInt(item.product_category_id),
          idSupplier: parseInt(item.idSupplier),
          sku: item.sku,
          unit_measurement: parseFloat(item.unit_measurement),
          unit_type: item.unit_type,
          reorder_quantity: parseInt(item.reorder_quantity),
          collisage: parseInt(item.collisage),
          depense: parseFloat(item.depense),
          gencode: item.gencode,
          marge: parseFloat(item.marge),
          marque: item.marque,
        };
      });
      // create many product from an array of object
      const createdProduct = await prisma.product.createMany({
        data: data,
        skipDuplicates: true,
      });
      // stock product's account transaction create
      await prisma.transaction.create({
        data: {
          date: new Date(),
          debit_id: 3,
          credit_id: 6,
          amount: totalPurchasePrice,
          particulars: `Initial stock of ${createdProduct.count} item/s of product`,
        },
      });

      // Log the create many action
      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'CREATE_MANY_PRODUCT',
          details: `Created ${createdProduct.count} products`,
        },
      });

      res.json(createdProduct);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  } else {
    try {
      // create one product from an object
      const file = req.file;

      const createdProduct = await prisma.product.create({
        data: {
          name: req.body.name,
          quantity: parseInt(req.body.quantity),
          purchase_price: parseFloat(req.body.purchase_price),
          sale_price: parseFloat(req.body.sale_price),
          imageName: file.filename,
          product_category: {
            connect: {
              id: Number(req.body.product_category_id),
            },
          },
          supplier: {
            connect : {
              id: Number(req.body.idSupplier),
            },
          },
          sku: req.body.sku,
          unit_measurement: parseFloat(req.body.unit_measurement),
          unit_type: req.body.unit_type,
          reorder_quantity: parseInt(req.body.reorder_quantity),
          collisage: parseInt(req.body.collisage),
          depense: parseFloat(req.body.depense),
          gencode: req.body.gencode,
          marge: parseFloat(req.body.marge),
          marque: req.body.marque,
        },
      });
      createdProduct.imageUrl = `${HOST}:${PORT}/v1/product-image/${file.filename}`;
      // stock product's account transaction create
      await prisma.transaction.create({
        data: {
          date: new Date(),
          debit_id: 3,
          credit_id: 6,
          amount:
            parseFloat(req.body.purchase_price) * parseInt(req.body.quantity),
          particulars: `Initial stock of product #${createdProduct.id}`,
        },
      });

      // Log the create action
      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'CREATE_PRODUCT',
          entityId: createdProduct.id,
          entityType: 'product',
          details: `Product ${createdProduct.name} created`,
        },
      });

      res.json(createdProduct);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  }
};

const getAllProduct = async (req, res) => {
  if (req.query.query === "all") {
    try {
      const allProduct = await prisma.product.findMany({
        orderBy: {
          id: "desc",
        },
        include: {
          product_category: {
            select: {
              name: true,
            },
          },
          supplier: {
            select: {
              name: true,
            },
          },
        },
      });
      // attach signed url to each product
      for (let product of allProduct) {
        if (product.imageName) {
          product.imageUrl = `${HOST}:${PORT}/v1/product-image/${product.imageName}`;
        }
      }

      // Log the get all products action
      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'GET_ALL_PRODUCTS',
          details: 'Retrieved all products',
        },
      });

      res.json(allProduct);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  } else if (req.query.query === "search") {
    try {
      const allProduct = await prisma.product.findMany({
        where: {
          OR: [
            {
              name: {
                contains: req.query.prod,
                mode: "insensitive",
              },
            },
            {
              sku: {
                contains: req.query.prod,
                mode: "insensitive",
              },
            },
          ],
        },
        orderBy: {
          id: "desc",
        },
        include: {
          product_category: {
            select: {
              name: true,
            },
          },
          supplier: {
            select: {
              name: true,
            },
          },
        },
      });
      // attach signed url to each product
      for (let product of allProduct) {
        if (product.imageName) {
          product.imageUrl = `${HOST}:${PORT}/v1/product-image/${product.imageName}`;
        }
      }

      // Log the search products action
      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'SEARCH_PRODUCTS',
          details: `Performed a search for products.`,
        },
      });

      res.json(allProduct);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  } else if (req.query.query === "info") {
    const aggregations = await prisma.product.aggregate({
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
      },
      where: {
        status: true,
      },
    });
    // get all product and calculate all purchase price and sale price
    const allProduct = await prisma.product.findMany();
    const totalPurchasePrice = allProduct.reduce((acc, cur) => {
      return acc + cur.quantity * cur.purchase_price;
    }, 0);
    const totalSalePrice = allProduct.reduce((acc, cur) => {
      return acc + cur.quantity * cur.sale_price;
    }, 0);

    // Log the get product info action
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_PRODUCT_INFO',
        details: 'Retrieved product information',
      },
    });

    res.json({ ...aggregations, totalPurchasePrice, totalSalePrice });
  } else if (req.query.status === "false") {
    try {
      const { skip, limit } = getPagination(req.query);
      const allProduct = await prisma.product.findMany({
        orderBy: {
          id: "desc",
        },
        where: {
          status: false,
        },
        include: {
          product_category: {
            select: {
              name: true,
            },
          },
          supplier: {
            select: {
              name: true,
            },
          },
        },
        skip: Number(skip),
        take: Number(limit),
      });
      // attach signed url to each product
      for (let product of allProduct) {
        if (product.imageName) {
          product.imageUrl = `${HOST}:${PORT}/v1/product-image/${product.imageName}`;
        }
      }

      // Log the get inactive products action
      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'GET_INACTIVE_PRODUCTS',
          details: 'Retrieved all inactive products',
        },
      });

      res.json(allProduct);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  } else {
    const { skip, limit } = getPagination(req.query);
    try {
      const allProduct = await prisma.product.findMany({
        orderBy: {
          id: "desc",
        },
        where: {
          status: true,
        },
        include: {
          product_category: {
            select: {
              name: true,
            },
          },
          supplier: {
            select: {
              name: true,
            },
          },
        },
        skip: Number(skip),
        take: Number(limit),
      });
      // attach signed url to each product
      for (let product of allProduct) {
        if (product.imageName) {
          product.imageUrl = `${HOST}:${PORT}/v1/product-image/${product.imageName}`;
        }
      }

      // Log the get active products action
      await prisma.auditLog.create({
        data: {
          userId: Number(req.auth.sub),
          action: 'GET_ACTIVE_PRODUCTS',
          details: 'Retrieved all active products.',
        },
      });

      res.json(allProduct);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const singleProduct = await prisma.product.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    if (singleProduct && singleProduct.imageName) {
      singleProduct.imageUrl = `${HOST}:${PORT}/v1/product-image/${singleProduct.imageName}`;
    }

    // Log the get single product action
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_SINGLE_PRODUCT',
        entityId: singleProduct.id,
        entityType: 'product',
        details: `Retrieved product named ${singleProduct.name}`,

      },
    });

    res.json(singleProduct);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

const updateSingleProduct = async (req, res) => {
  try {
    // Récupérer les informations actuelles avant la mise à jour
    const oldProduct = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });

    // Mettre à jour le produit
    const updatedProduct = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        name: req.body.name,
        quantity: parseInt(req.body.quantity),
        unit_measurement: parseFloat(req.body.unit_measurement),
        purchase_price: parseFloat(req.body.purchase_price),
        sale_price: parseFloat(req.body.sale_price),
        collisage: parseInt(req.body.collisage),
        depense: parseFloat(req.body.depense),
        gencode: req.body.gencode,
        marge: parseFloat(req.body.marge),
        marque: req.body.marque,
      },
    });

    // Créer un message de détails avec les changements
    const changes = [];
    if (oldProduct.name !== updatedProduct.name) {
      changes.push(`Name: ${oldProduct.name} -> ${updatedProduct.name}`);
    }
    if (oldProduct.quantity !== updatedProduct.quantity) {
      changes.push(`Quantity: ${oldProduct.quantity} -> ${updatedProduct.quantity}`);
    }
    if (oldProduct.unit_measurement !== updatedProduct.unit_measurement) {
      changes.push(`Unit Measurement: ${oldProduct.unit_measurement} -> ${updatedProduct.unit_measurement}`);
    }
    if (oldProduct.purchase_price !== updatedProduct.purchase_price) {
      changes.push(`Purchase Price: ${oldProduct.purchase_price} -> ${updatedProduct.purchase_price}`);
    }
    if (oldProduct.sale_price !== updatedProduct.sale_price) {
      changes.push(`Sale Price: ${oldProduct.sale_price} -> ${updatedProduct.sale_price}`);
    }
    if (oldProduct.collisage !== updatedProduct.collisage) {
      changes.push(`Collisage: ${oldProduct.collisage} -> ${updatedProduct.collisage}`);
    }
    if (oldProduct.depense !== updatedProduct.depense) {
      changes.push(`Depense: ${oldProduct.depense} -> ${updatedProduct.depense}`);
    }
    if (oldProduct.gencode !== updatedProduct.gencode) {
      changes.push(`Gencode: ${oldProduct.gencode} -> ${updatedProduct.gencode}`);
    }
    if (oldProduct.marge !== updatedProduct.marge) {
      changes.push(`Marge: ${oldProduct.marge} -> ${updatedProduct.marge}`);
    }
    if (oldProduct.marque !== updatedProduct.marque) {
      changes.push(`Marque: ${oldProduct.marque} -> ${updatedProduct.marque}`);
    }

    // Ajouter une entrée dans les logs
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'UPDATE_PRODUCT',
        entityId: updatedProduct.id,
        entityType: 'product',
        details: `Updated product named ${updatedProduct.name}. Changes: ${changes.join(', ')}`,
      },
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};


const deleteSingleProduct = async (req, res) => {
  try {
    const deletedProduct = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status: req.body.status,
      },
    });
    // TODO: implement delete image from disk
    // if (deletedProduct && deletedProduct.imageName) {
    //   await deleteFile(deletedProduct.imageName);
    // }

    // Log the delete action
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'DELETE_PRODUCT',
        entityId: deletedProduct.id,
        entityType: 'product',
        details: `Deleted product named: ${deletedProduct.name}`,
      },
    });
    
    res.json(deletedProduct);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

module.exports = {
  createSingleProduct,
  getAllProduct,
  getSingleProduct,
  updateSingleProduct,
  deleteSingleProduct,
};
