const express = require("express");
const multer = require("multer");
const path = require("path");
const xlsx = require("xlsx");
const {
  createSingleProductCategory,
  getAllProductCategory,
  getSingleProductCategory,
  updateSingleProductCategory,
  deleteSingleProductCategory,
} = require("./productCategory.controllers");
const authorize = require("../../../../utils/authorize"); // Middleware d'authentification

const productCategoryRoutes = express.Router();

// Configuration de Multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Dossier où stocker les fichiers
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Générer un nom unique
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /xlsx|xls|csv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Seuls les fichiers Excel ou CSV sont autorisés"));
  },
});

// Endpoint pour uploader un fichier Excel/CSV et récupérer les données
productCategoryRoutes.post(
  "/v1/upload-excel",
  authorize("createProductCategory"),
  upload.single("file"),
  async (req, res) => {
    try {
      console.log("Fichier reçu :", req.file);

      if (!req.file) {
        return res.status(400).json({ success: false, message: "Aucun fichier reçu" });
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheetNameList = workbook.SheetNames;
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

      return res.status(200).json({
        success: true,
        message: "Fichier uploadé avec succès",
        data: data,
      });
    } catch (error) {
      console.error("Erreur lors du traitement du fichier :", error);
      return res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }
);

// CRUD des catégories de produits
productCategoryRoutes.post("/", authorize("createProductCategory"), createSingleProductCategory);
productCategoryRoutes.get("/", authorize("viewProductCategory"), getAllProductCategory);
productCategoryRoutes.get("/:id", authorize("viewProductCategory"), getSingleProductCategory);
productCategoryRoutes.put("/:id", authorize("updateProductCategory"), updateSingleProductCategory);
productCategoryRoutes.delete("/:id", authorize("deleteProductCategory"), deleteSingleProductCategory);

module.exports = productCategoryRoutes;
