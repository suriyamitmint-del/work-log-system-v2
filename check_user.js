const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { username: 'test_level_2' },
    include: {
      _count: {
        select: {
          createdCarePlans: true,
          approvedCarePlans: true,
          assignedCarePlans: true,
          homeVisits: true
        }
      }
    }
  });
  console.log(user);
}
checkUser();
