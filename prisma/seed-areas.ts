import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const areas = [
  // 1. กรุงเทพมหานคร
  { province: "กรุงเทพมหานคร", district: "เขตพระนคร", subDistrict: "พระบรมมหาราชวัง", zipCode: "10200" },
  { province: "กรุงเทพมหานคร", district: "เขตพระนคร", subDistrict: "วังบูรพาภิรมย์", zipCode: "10200" },
  { province: "กรุงเทพมหานคร", district: "เขตดุสิต", subDistrict: "ดุสิต", zipCode: "10300" },
  { province: "กรุงเทพมหานคร", district: "เขตดุสิต", subDistrict: "วชิรพยาบาล", zipCode: "10300" },
  { province: "กรุงเทพมหานคร", district: "เขตบางกะปิ", subDistrict: "คลองจั่น", zipCode: "10240" },
  { province: "กรุงเทพมหานคร", district: "เขตบางกะปิ", subDistrict: "หัวหมาก", zipCode: "10240" },
  { province: "กรุงเทพมหานคร", district: "เขตพญาไท", subDistrict: "สามเสนใน", zipCode: "10400" },
  
  // 2. เชียงใหม่
  { province: "เชียงใหม่", district: "เมืองเชียงใหม่", subDistrict: "ศรีภูมิ", zipCode: "50200" },
  { province: "เชียงใหม่", district: "เมืองเชียงใหม่", subDistrict: "พระสิงห์", zipCode: "50200" },
  { province: "เชียงใหม่", district: "จอมทอง", subDistrict: "บ้านหลวง", zipCode: "50160" },
  { province: "เชียงใหม่", district: "จอมทอง", subDistrict: "ข่วงเปา", zipCode: "50160" },
  { province: "เชียงใหม่", district: "แม่แจ่ม", subDistrict: "ช่างเคิ่ง", zipCode: "50270" },
  { province: "เชียงใหม่", district: "แม่แจ่ม", subDistrict: "ท่าผา", zipCode: "50270" },
  { province: "เชียงใหม่", district: "เชียงดาว", subDistrict: "เชียงดาว", zipCode: "50170" },
  { province: "เชียงใหม่", district: "เชียงดาว", subDistrict: "เมืองงาย", zipCode: "50170" },
  
  // 3. ขอนแก่น (ทดสอบตำบลชื่อซ้ำกัน แต่อยู่คนละอำเภอ/รหัสไปรษณีย์)
  { province: "ขอนแก่น", district: "เมืองขอนแก่น", subDistrict: "ในเมือง", zipCode: "40000" },
  { province: "ขอนแก่น", district: "เมืองขอนแก่น", subDistrict: "ศิลา", zipCode: "40000" },
  { province: "ขอนแก่น", district: "บ้านไผ่", subDistrict: "ในเมือง", zipCode: "40110" }, // ชื่อซ้ำ!
  { province: "ขอนแก่น", district: "บ้านไผ่", subDistrict: "บ้านไผ่", zipCode: "40110" },
  { province: "ขอนแก่น", district: "ชุมแพ", subDistrict: "ชุมแพ", zipCode: "40130" },
  { province: "ขอนแก่น", district: "ชุมแพ", subDistrict: "หนองไผ่", zipCode: "40130" },
  { province: "ขอนแก่น", district: "น้ำพอง", subDistrict: "น้ำพอง", zipCode: "40140" },
  { province: "ขอนแก่น", district: "น้ำพอง", subDistrict: "วังชัย", zipCode: "40140" },
];

async function main() {
  console.log('Start seeding areas...');
  
  // Clear existing areas if needed (optional)
  // await prisma.area.deleteMany({});

  let count = 0;
  for (const a of areas) {
    // Upsert or create
    const existing = await prisma.area.findFirst({
      where: {
        province: a.province,
        district: a.district,
        subDistrict: a.subDistrict,
        zipCode: a.zipCode
      }
    });

    if (!existing) {
      await prisma.area.create({
        data: {
          province: a.province,
          district: a.district,
          subDistrict: a.subDistrict,
          zipCode: a.zipCode
        }
      });
      count++;
    }
  }

  console.log(`Seeded ${count} new areas successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
