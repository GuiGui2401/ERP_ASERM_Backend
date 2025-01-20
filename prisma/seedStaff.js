const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();


const prisma = new PrismaClient();
const saltRounds = 10;

async function seedStaffUser() {
  try {
    // Hash du mot de passe avec bcrypt
    const staffHash = await bcrypt.hash("staff", saltRounds);

    // Création de l'utilisateur staff dans la base de données
    await prisma.user.create({
      data: {
        firstName: "Staff",
        lastName: "Test",
        userName: "staff",
        password: staffHash,
        employmentStatusId: 3,
        departmentId: 1,
        roleId: 2,
        shiftId: 1,
        leavePolicyId: 1,
        weeklyHolidayId: 1,
      },
    });

    console.log('L\'utilisateur "Staff" a été inséré avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'insertion de l\'utilisateur "Staff" :', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStaffUser();
