const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const sendReminderEmail = require('./mailService');

cron.schedule('06 17 * * *', async () => {
  console.log('Vérification des rappels de promesse d\'achat...');
  const today = new Date();

  const promisesToRemind = await prisma.salePromise.findMany({
    where: {
      reminderDate: {
        lte: today // Vérifie les dates de rappel passées ou égales à aujourd'hui
      }
    },
    include: {
      user: true // Récupère les données de l'utilisateur associé
    }
  });

  promisesToRemind.forEach(promise => {
    const emailContent = `
      Bonjour ${promise.user.firstName || promise.user.userName},
      Ceci est un rappel pour la promesse d'achat de ${promise.customer_name}.
      Numéro de téléphone: ${promise.customer_phone}.
      Date d'échéance: ${promise.dueDate}.
    `;

    // Envoi du mail à l'utilisateur qui a enregistré la promesse de vente
    if (promise.user.email) {
      sendReminderEmail(promise.user.email, 'Rappel de promesse d\'achat', emailContent);
      console.log('message envoyée');
    } else {
      console.log(`L'utilisateur avec l'ID ${promise.user_id} n'a pas d'email.`);
    }
  });
});
