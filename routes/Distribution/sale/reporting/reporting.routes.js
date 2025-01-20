const express = require('express');
const router = express.Router();
const { createReporting, getAllReportings, getSingleReport, deleteSingleReport } = require('./reporting.controller');

const multer = require('multer');
const path = require('path');

const authorize = require('../../../../utils/authorize'); // Middleware d'authentification

// Configuration de multer pour le téléchargement de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Renomme le fichier avec un timestamp
  }
});

const upload = multer({ storage });

// Routes pour les reportings
router.post('/', upload.single('file'), createReporting);
router.get('/all', authorize('readAll-Report'), getAllReportings);
router.get('/:id', authorize('readSingle-Report'), getSingleReport);
router.patch('/:id', authorize('delete-Report'), deleteSingleReport);

module.exports = router;
