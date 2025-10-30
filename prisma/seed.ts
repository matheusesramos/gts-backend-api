// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categoriesData = [
  { name: "Cleaning", slug: "cleaning", order: 1 },
  { name: "Carpet", slug: "carpet", order: 2 },
  { name: "Upholstery", slug: "upholstery", order: 3 },
  { name: "External", slug: "external", order: 4 },
  { name: "Garden", slug: "garden", order: 5 },
];

const servicesData = [
  {
    name: "Top Up",
    slug: "top-up",
    description: "Quick refresh for regularly maintained areas.",
    shortDescription: "Quick refresh service",
    imageUrl: "top-up-thumbnail.png",
    category: "Cleaning",
    order: 1,
  },
  {
    name: "Light Clean",
    slug: "light-clean",
    description: "Surface cleaning and tidying up of visible areas.",
    shortDescription: "Surface cleaning",
    imageUrl: "light-clean-thumbnail.png",
    category: "Cleaning",
    order: 2,
  },
  {
    name: "Professional",
    slug: "professional",
    description:
      "Deep cleaning with attention to detail and specialized treatments.",
    shortDescription: "Deep cleaning service",
    imageUrl: "professional-thumbnail.png",
    category: "Cleaning",
    order: 3,
  },
  {
    name: "Living Room",
    slug: "living-room",
    description: "Deep cleaning for carpets in living areas.",
    shortDescription: "Living area carpet cleaning",
    imageUrl: "living-room-thumbnail.png",
    category: "Carpet",
    order: 1,
  },
  {
    name: "Staircase",
    slug: "staircase",
    description: "Cleaning service specifically for staircases.",
    shortDescription: "Staircase cleaning",
    imageUrl: "staircase-thumbnail.png",
    category: "Carpet",
    order: 2,
  },
  {
    name: "Hallway",
    slug: "hallway",
    description: "Cleaning service for hallways and entrance areas.",
    shortDescription: "Hallway cleaning",
    imageUrl: "hallway-thumbnail.png",
    category: "Carpet",
    order: 3,
  },
  {
    name: "Bedroom",
    slug: "bedroom",
    description: "Carpet cleaning tailored for bedrooms.",
    shortDescription: "Bedroom carpet cleaning",
    imageUrl: "bedroom-thumbnail.png",
    category: "Carpet",
    order: 4,
  },
  {
    name: "Lounge",
    slug: "lounge",
    description: "Cleaning of carpets in lounges or similar areas.",
    shortDescription: "Lounge carpet cleaning",
    imageUrl: "lounge-thumbnail.png",
    category: "Carpet",
    order: 5,
  },
  {
    name: "Living-dining Room",
    slug: "living-dining-room",
    description:
      "Comprehensive carpet cleaning for combined living and dining areas.",
    shortDescription: "Living-dining area cleaning",
    imageUrl: "living-dining-room-thumbnail.png",
    category: "Carpet",
    order: 6,
  },
  {
    name: "Rug",
    slug: "rug",
    description: "Cleaning service for individual rugs.",
    shortDescription: "Rug cleaning",
    imageUrl: "rug-thumbnail.png",
    category: "Carpet",
    order: 7,
  },
  {
    name: "Corridor",
    slug: "corridor",
    description: "Cleaning service for corridors and passageways.",
    shortDescription: "Corridor cleaning",
    imageUrl: "corridor-thumbnail.png",
    category: "Carpet",
    order: 8,
  },
  {
    name: "Curtains",
    slug: "curtains",
    description: "Steam Cleaning service for curtains and drapery.",
    shortDescription: "Curtain steam cleaning",
    imageUrl: "curtains-thumbnail.png",
    category: "Upholstery",
    order: 1,
  },
  {
    name: "Sofa",
    slug: "sofa",
    description: "Steam Cleaning service for sofas and couches.",
    shortDescription: "Sofa steam cleaning",
    imageUrl: "sofa-thumbnail.png",
    category: "Upholstery",
    order: 2,
  },
  {
    name: "Mattress",
    slug: "mattress",
    description: "Steam Cleaning service specifically for mattresses.",
    shortDescription: "Mattress steam cleaning",
    imageUrl: "mattress-thumbnail.png",
    category: "Upholstery",
    order: 3,
  },
  {
    name: "Cushions",
    slug: "cushions",
    description: "Steam Cleaning service for cushions and pillows.",
    shortDescription: "Cushion steam cleaning",
    imageUrl: "cushions-thumbnail.png",
    category: "Upholstery",
    order: 4,
  },
  {
    name: "Jet Wash",
    slug: "jet-wash",
    description: "High-pressure cleaning for external surfaces.",
    shortDescription: "High-pressure cleaning",
    imageUrl: "jet-wash-thumbnail.png",
    category: "External",
    order: 1,
  },
  {
    name: "Junk Removal",
    slug: "junk-removal",
    description: "Removal service for unwanted items and debris.",
    shortDescription: "Junk removal service",
    imageUrl: "junk-removal-thumbnail.png",
    category: "External",
    order: 2,
  },
  {
    name: "Window Cleaning Outside",
    slug: "window-cleaning-outside",
    description: "Exterior cleaning service for windows.",
    shortDescription: "Exterior window cleaning",
    imageUrl: "window-cleaning-outside-thumbnail.png",
    category: "External",
    order: 3,
  },
  {
    name: "Rubbish/Waste Removal",
    slug: "rubbish-waste-removal",
    description: "Disposal service for rubbish and waste materials.",
    shortDescription: "Waste disposal service",
    imageUrl: "rubbish-waste-removal-thumbnail.png",
    category: "External",
    order: 4,
  },
  {
    name: "Furniture Removal",
    slug: "furniture-removal",
    description: "Removal service for furniture items.",
    shortDescription: "Furniture removal service",
    imageUrl: "furniture-removal-thumbnail.png",
    category: "External",
    order: 5,
  },
  {
    name: "Pressure Washing",
    slug: "pressure-washing",
    description:
      "Cleaning service for outdoor surfaces using high-pressure washing.",
    shortDescription: "Outdoor pressure washing",
    imageUrl: "pressure-washing-thumbnail.png",
    category: "Garden",
    order: 1,
  },
  {
    name: "Lawn Mowing",
    slug: "lawn-mowing",
    description: "Grass cutting service for lawns.",
    shortDescription: "Lawn mowing service",
    imageUrl: "lawn-mowing-thumbnail.png",
    category: "Garden",
    order: 2,
  },
  {
    name: "Weeding",
    slug: "weeding",
    description: "Removal of weeds from garden areas.",
    shortDescription: "Garden weeding",
    imageUrl: "weeding-thumbnail.png",
    category: "Garden",
    order: 3,
  },
  {
    name: "Hedge Trimming",
    slug: "hedge-trimming",
    description: "Trimming and shaping of hedges.",
    shortDescription: "Hedge trimming service",
    imageUrl: "hedge-trimming-thumbnail.png",
    category: "Garden",
    order: 4,
  },
  {
    name: "Bush Pruning",
    slug: "bush-pruning",
    description: "Pruning and maintenance service for bushes.",
    shortDescription: "Bush pruning service",
    imageUrl: "bush-pruning-thumbnail.png",
    category: "Garden",
    order: 5,
  },
  {
    name: "Leaves Cleaning",
    slug: "leaves-cleaning",
    description: "Removal of leaves from garden and outdoor areas.",
    shortDescription: "Leaf removal service",
    imageUrl: "leaves-cleaning-thumbnail.png",
    category: "Garden",
    order: 6,
  },
  {
    name: "Ivy",
    slug: "ivy",
    description: "Removal of ivy from garden and other areas.",
    shortDescription: "Ivy removal service",
    imageUrl: "ivy-thumbnail.png",
    category: "Garden",
    order: 6,
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Criar categorias
  console.log("📁 Creating categories...");
  for (const categoryData of categoriesData) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData,
    });
  }
  console.log("✅ Categories created!");

  // Criar serviços
  console.log("🛠️  Creating services...");
  for (const serviceData of servicesData) {
    const category = await prisma.category.findUnique({
      where: { slug: serviceData.category.toLowerCase() },
    });

    if (category) {
      await prisma.service.upsert({
        where: { slug: serviceData.slug },
        update: {},
        create: {
          name: serviceData.name,
          slug: serviceData.slug,
          description: serviceData.description,
          shortDescription: serviceData.shortDescription,
          imageUrl: serviceData.imageUrl,
          categoryId: category.id,
          order: serviceData.order,
        },
      });
    }
  }
  console.log("✅ Services created!");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
