const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearData() {
  console.log('Clearing HomeVisits...');
  await prisma.homeVisit.deleteMany();
  
  console.log('Clearing CarePlans...');
  await prisma.carePlan.deleteMany();
  
  console.log('Clearing Patients...');
  await prisma.patient.deleteMany();
  
  console.log('Clearing non-admin Users...');
  const result = await prisma.user.deleteMany({
    where: {
      role: {
        not: 'ADMIN'
      }
    }
  });
  console.log(`Deleted ${result.count} users.`);
  
  console.log('Data cleared successfully.');
}

clearData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
