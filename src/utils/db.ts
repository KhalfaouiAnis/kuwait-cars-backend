import { prisma } from "database";

export async function seedCategories() {
  const categoriesData = [
    {
      name: "Cars for sale",
      id: "cars_for_sale",
      subcategories: [
        { name: "Sports Cars", id: "sport_cars" },
        { name: "Sports Bikes", id: "sport_bikes" },
      ],
    },
    {
      name: "Home services",
      id: "home_services",
      subcategories: [{ name: "Home services", id: "home_services" }],
    },
    {
      name: "New cars",
      id: "new_cars",
      subcategories: [{ name: "New cars", id: "new_cars" }],
    },
    {
      name: "Car Rental Agencies",
      id: "Car_Rental_Agencies",
      subcategories: [{ name: "New cars", id: "Car_Rental_Agencies" }],
    },
    {
      name: "Motorcycles",
      id: "Motorcycles",
      subcategories: [{ name: "New cars", id: "Motorcycles" }],
    },
    {
      name: "Classic cars",
      id: "Classic_cars",
      subcategories: [{ name: "New cars", id: "Classic_cars" }],
    },
    {
      name: "Damaged cars",
      id: "Damaged_cars",
      subcategories: [{ name: "New cars", id: "Damaged_cars" }],
    },
    {
      name: "Rims and tires",
      id: "Rims_and_tires",
      subcategories: [{ name: "New cars", id: "Rims_and_tires" }],
    },
    {
      name: "spare parts",
      id: "spare_parts",
      subcategories: [{ name: "New cars", id: "spare_parts" }],
    },
    {
      name: "Logistics",
      id: "Logistics",
      subcategories: [{ name: "New cars", id: "Logistics" }],
    },
    {
      name: "Repair garages",
      id: "Repair garages",
      subcategories: [{ name: "New cars", id: "Repair garages" }],
    },
    {
      name: "Offer",
      id: "offer",
      subcategories: [{ name: "New cars", id: "offer" }],
    },
    {
      name: "Accessories",
      id: "Accessories",
      subcategories: [{ name: "New cars", id: "Accessories" }],
    },
    {
      name: "Other",
      id: "Other",
      subcategories: [{ name: "New cars", id: "Other" }],
    },
  ];

  await prisma.$transaction(async (tx) => {
    for (const cat of categoriesData) {
      const category = await tx.category.create({
        data: {
          id: cat.id,
          name: cat.name,
        },
      });

      for (const sub of cat.subcategories) {
        await tx.subcategory.create({
          data: {
            id: sub.id,
            name: sub.name,
            category_id: category.id,
          },
        });
      }
    }
  });

  console.log("Seeding completed: Categories and subcategories added.");
}
