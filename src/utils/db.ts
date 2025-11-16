import { prisma } from "database";

export async function seedCategories() {
  const categoriesData = [
    {
      name: "Cars for sale",
      id: "cars_for_sale",
    },
    {
      name: "Home services",
      id: "home_services",
    },
    {
      name: "New cars",
      id: "new_cars",
    },
    {
      name: "Car Rental Agencies",
      id: "Car_Rental_Agencies",
    },
    {
      name: "Motorcycles",
      id: "Motorcycles",
    },
    {
      name: "Classic cars",
      id: "Classic_cars",
    },
    {
      name: "Damaged cars",
      id: "Damaged_cars",
    },
    {
      name: "Rims and tires",
      id: "Rims_and_tires",
    },
    {
      name: "spare parts",
      id: "spare_parts",
    },
    {
      name: "Logistics",
      id: "Logistics",
    },
    {
      name: "Repair garages",
      id: "Repair garages",
    },
    {
      name: "Show",
      id: "show",
    },
    {
      name: "Accessories",
      id: "Accessories",
    },
    {
      name: "Other",
      id: "Other",
    },
  ];

  await prisma.$transaction(async (tx) => {
    for (const cat of categoriesData) {
      await tx.category.create({
        data: {
          id: cat.id,
          name: cat.name,
        },
      });
    }
  });

  console.log("Seeding completed: Categories added.");
}
