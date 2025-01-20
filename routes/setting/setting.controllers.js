const { getPagination } = require("../../utils/query");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const updateSetting = async (req, res) => {
  try {
    const updatedSetting = await prisma.appSetting.update({
      where: {
        id: 1,
      },
      data: { ...req.body },
    });

    // Journalisation
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub), // L'ID de l'utilisateur qui a effectué l'action
        action: 'UPDATE_SETTING',
        entityId: updatedSetting.id,
        entityType: 'appSetting',
        details: `Updated App Setting with ID ${updatedSetting.id}. Changes: ${JSON.stringify(req.body)}`,
      },
    });

    res.status(201).json(updatedSetting);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

const getSetting = async (req, res) => {
  try {
    const newSetting = await prisma.appSetting.findUnique({
      where: {
        id: 1,
      },
    });

    // Journalisation
    await prisma.auditLog.create({
      data: {
        userId: Number(req.auth.sub), // L'ID de l'utilisateur qui a effectué l'action
        action: 'GET_SETTING',
        entityId: newSetting.id,
        entityType: 'appSetting',
        details: `Retrieved App Setting with ID ${newSetting.id}.`,
      },
    });
    
    res.status(201).json(newSetting);
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

module.exports = {
  updateSetting,
  getSetting,
};
