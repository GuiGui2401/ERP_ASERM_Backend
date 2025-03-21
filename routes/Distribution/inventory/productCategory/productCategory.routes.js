const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadProductCategory,
  createSingleProductCategory,
  getAllProductCategory,
  getSingleProductCategory,
  updateSingleProductCategory,
  deleteSingleProductCategory,
} = require("./productCategory.controllers");
const authorize = require("../../../../utils/authorize"); // Middleware d'authentification

const productCategoryRoutes = express.Router();

// Configuration de Multer (Stockage temporaire des fichiers)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // 📁 Dossier temporaire
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // 🔄 Nom unique du fichier
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
    cb(new Error("Seuls les fichiers Excel (.xls, .xlsx) ou CSV (.csv) sont autorisés"));
  },
});

// Endpoint pour uploader un fichier Excel/CSV et importer les catégories
productCategoryRoutes.post(
  "/v1/upload-excel",
  authorize("createProductCategory"), // Vérification des permissions
  upload.single("file"), // Gestion de l'upload
  uploadProductCategory // Utilisation du contrôleur amélioré
);

//  CRUD des catégories de produits
productCategoryRoutes.post("/", authorize("createProductCategory"), createSingleProductCategory);
productCategoryRoutes.get("/", authorize("viewProductCategory"), getAllProductCategory);
productCategoryRoutes.get("/:id", authorize("viewProductCategory"), getSingleProductCategory);
productCategoryRoutes.put("/:id", authorize("updateProductCategory"), updateSingleProductCategory);
productCategoryRoutes.delete("/:id", authorize("deleteProductCategory"), deleteSingleProductCategory);

module.exports = productCategoryRoutes;
