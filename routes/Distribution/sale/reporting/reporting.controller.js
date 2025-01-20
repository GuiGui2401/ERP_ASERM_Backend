//const { getPaginationLogs } = require("./utils/query");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createReporting = async (req, res) => {
  const {
    prospectName,
    date,
    degree,
    rdvObject,
    nextRdv,
    time,
    contact,
    pharmacoVigilance,
    latitude,
    longitude,
  } = req.body;

  try {
    // Sauvegarder le reporting avec le chemin du fichier
    const reporting = await prisma.reporting.create({
      data: {
        prospectName,
        date: new Date(date), // Assurez-vous que le format de date est correct
        degree,
        rdvObject,
        nextRdv: new Date(nextRdv), // Assurez-vous que le format de date est correct
        time,
        contact,
        pharmacoVigilance,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        filePath: req.file ? req.file.path : null, // Stocke le chemin du fichier si disponible
      },
    });

    res.status(201).json(reporting);
  } catch (error) {
    console.error('Erreur lors de la création du reporting:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la création du reporting.' });
  }
};

const getAllReportings = async (req, res) => {
  try {
    const allReportings = await prisma.reporting.findMany({
      orderBy: { date: 'desc' },
    });
    res.status(200).json(allReportings);
  } catch (error) {
    console.error('Erreur lors de la récupération des reportings:', error);
    res.status(500).json({ error: 'Une erreur est survenue.' });
  }
};

// Récupérer un rapport spécifique
const getSingleReport = async (req, res) => {
  try {
    const singleReport = await prisma.report.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        relatedData: true, // Remplacez "relatedData" par les champs de relations spécifiques de votre modèle
      },
    });

    // Journalisation de l'accès au rapport
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'GET_SINGLE_REPORT',
        entityId: singleReport.id,
        entityType: 'report',
        details: `Retrieved report with ID ${singleReport.id}.`,
      },
    });

    res.json(singleReport);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

// Désactiver (supprimer) un rapport
const deleteSingleReport = async (req, res) => {
  try {
    const deletedReport = await prisma.report.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        status: req.body.status,
      },
    });

    // Journalisation de la suppression du rapport
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub),
        action: 'DELETE_SINGLE_REPORT',
        entityId: deletedReport.id,
        entityType: 'report',
        details: `Deleted report with ID ${deletedReport.id}.`,
      },
    });

    res.json(deletedReport);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

module.exports = {
  createReporting,
  getAllReportings, // ajoutez cette fonction d'exportation
  getSingleReport, 
  deleteSingleReport
};
