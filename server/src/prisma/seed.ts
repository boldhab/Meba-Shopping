import 'dotenv/config';
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ProductStatus,
  DealType,
  ReviewStatus,
  Role,
  OrderStatus,
  PaymentStatus,
  MessageCategory,
} from "@prisma/client";
import pg from "pg";
import { hashPassword } from "../utils/hashPassword";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_ADMIN_EMAIL = "admin@meba.local";
const DEFAULT_ADMIN_PASSWORD = "Admin1234!";
const DEFAULT_ADMIN_NAME = "Meba Admin";

const DEFAULT_CUSTOMER_EMAIL = "customer@meba.local";
const DEFAULT_CUSTOMER_PASSWORD = "Customer1234!";
const DEFAULT_CUSTOMER_NAME = "Sarah Jenkins";

const SECONDARY_CUSTOMER_EMAIL = "dawit@meba.local";
const SECONDARY_CUSTOMER_PASSWORD = "Customer1234!";
const SECONDARY_CUSTOMER_NAME = "Dawit Tadesse";

export async function seed() {
  console.log("🌱 Seeding database with rich e-commerce catalog and user activity...");

  const adminPasswordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
  const customerPasswordHash = await hashPassword(DEFAULT_CUSTOMER_PASSWORD);
  const secondaryPasswordHash = await hashPassword(SECONDARY_CUSTOMER_PASSWORD);

  // 1. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {
      name: DEFAULT_ADMIN_NAME,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      phone: "+251 91 100 0001",
    },
    create: {
      name: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      phone: "+251 91 100 0001",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: DEFAULT_CUSTOMER_EMAIL },
    update: {
      name: DEFAULT_CUSTOMER_NAME,
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      phone: "+251 91 234 5678",
    },
    create: {
      name: DEFAULT_CUSTOMER_NAME,
      email: DEFAULT_CUSTOMER_EMAIL,
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      phone: "+251 91 234 5678",
    },
  });

  const dawit = await prisma.user.upsert({
    where: { email: SECONDARY_CUSTOMER_EMAIL },
    update: {
      name: SECONDARY_CUSTOMER_NAME,
      passwordHash: secondaryPasswordHash,
      role: Role.CUSTOMER,
      phone: "+251 92 876 5432",
    },
    create: {
      name: SECONDARY_CUSTOMER_NAME,
      email: SECONDARY_CUSTOMER_EMAIL,
      passwordHash: secondaryPasswordHash,
      role: Role.CUSTOMER,
      phone: "+251 92 876 5432",
    },
  });

  // 2. Seed Customer Addresses
  await prisma.address.deleteMany({ where: { userId: customer.id } });
  await prisma.address.createMany({
    data: [
      {
        userId: customer.id,
        label: "Home (Bole)",
        line1: "Bole Subcity, Woreda 03, House 42",
        city: "Addis Ababa",
        isDefault: true,
      },
      {
        userId: customer.id,
        label: "Office (Kazanchis)",
        line1: "Kazanchis, Commercial Tower 5th Floor",
        city: "Addis Ababa",
        isDefault: false,
      },
    ],
  });

  // 3. Seed User Preferences
  await prisma.userPreference.upsert({
    where: { userId: customer.id },
    update: {
      emailOrderUpdates: true,
      emailWishlistAlerts: true,
      emailPromotions: true,
      smsAlerts: true,
      pushNotifications: true,
      newsletter: true,
      currency: "ETB",
      language: "English",
    },
    create: {
      userId: customer.id,
      emailOrderUpdates: true,
      emailWishlistAlerts: true,
      emailPromotions: true,
      smsAlerts: true,
      pushNotifications: true,
      newsletter: true,
      currency: "ETB",
      language: "English",
    },
  });

  // 4. Seed Categories
  const categoriesData = [
    { name: "Fresh Produce", slug: "fresh-produce" },
    { name: "Groceries", slug: "groceries" },
    { name: "Bakery", slug: "bakery" },
    { name: "Dairy & Eggs", slug: "dairy-and-eggs" },
    { name: "Coffee & Tea", slug: "coffee-tea" },
    { name: "Beverages", slug: "beverages" },
    { name: "Electronics", slug: "electronics" },
    { name: "Home & Kitchen", slug: "home-kitchen" },
    { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
    { name: "Fashion", slug: "fashion" },
    { name: "Health & Fitness", slug: "health-fitness" },
    { name: "Pet Supplies", slug: "pet-supplies" },
  ];

  const categoriesMap: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    categoriesMap[cat.slug] = created;
  }

  // 5. Seed Comprehensive Product Catalog (26 Products)
  const productsData = [
    {
      name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
      slug: "wireless-headphones",
      price: 24500,
      stock: 18,
      status: ProductStatus.ACTIVE,
      categorySlug: "electronics",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      description: "Industry-leading noise cancellation optimized with dual processors and 8 microphones. Up to 30-hour battery life with ultra-fast charging.",
      dealType: DealType.DAILY,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isFeatured: true,
    },
    {
      name: "Yirgacheffe Single-Origin Specialty Coffee Beans (500g)",
      slug: "ethiopian-specialty-coffee",
      price: 950,
      stock: 65,
      status: ProductStatus.ACTIVE,
      categorySlug: "coffee-tea",
      imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80",
      description: "Grade 1 washed heirloom Arabica grown in the misty highlands of Yirgacheffe. Floral jasmine notes, bergamot citrus, and honey sweetness.",
      dealType: DealType.WEEKLY,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isFeatured: true,
    },
    {
      name: "Organic Ethiopian Highland Raw Honey (1kg)",
      slug: "organic-highland-honey",
      price: 820,
      stock: 40,
      status: ProductStatus.ACTIVE,
      categorySlug: "groceries",
      imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80",
      description: "100% unpasteurized raw forest honey harvested sustainably from the pristine biodiverse forests of southwestern Ethiopia.",
      dealType: null,
      isDealActive: false,
      isFeatured: true,
    },
    {
      name: "Fresh Hass Avocados (Pack of 4)",
      slug: "fresh-hass-avocados",
      price: 280,
      stock: 90,
      status: ProductStatus.ACTIVE,
      categorySlug: "fresh-produce",
      imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80",
      description: "Creamy, rich Hass avocados freshly picked and perfectly ripened. Ideal for salads, guacamole, and wholesome breakfast toasts.",
      dealType: DealType.DAILY,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isFeatured: false,
    },
    {
      name: "Traditional Artisanal Sourdough Bread (Loaf)",
      slug: "artisanal-sourdough-bread",
      price: 320,
      stock: 25,
      status: ProductStatus.ACTIVE,
      categorySlug: "bakery",
      imageUrl: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800&q=80",
      description: "Naturally fermented for 24 hours with a crisp caramel crust and open, chewy crumb. Freshly baked every dawn at Meba Supermarket Bakery.",
      dealType: null,
      isDealActive: false,
      isFeatured: false,
    },
    {
      name: "Free-Range Farm Fresh Eggs (Pack of 30)",
      slug: "free-range-farm-eggs",
      price: 750,
      stock: 50,
      status: ProductStatus.ACTIVE,
      categorySlug: "dairy-and-eggs",
      imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80",
      description: "Grade A golden-yolk farm eggs from pasture-raised hens with no antibiotics or hormones. Packed with clean natural protein.",
      dealType: null,
      isDealActive: false,
      isFeatured: false,
    },
    {
      name: "Ethiopian Spiced Clarified Butter - Pure Kibe (500g)",
      slug: "traditional-spiced-butter-kibe",
      price: 1100,
      stock: 32,
      status: ProductStatus.ACTIVE,
      categorySlug: "dairy-and-eggs",
      imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80",
      description: "Traditional slow-simmered spiced clarified butter infused with kosseret, korarima, and sacred Ethiopian herbs. Essential for Doro Wat.",
      dealType: DealType.CEREMONY,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isFeatured: true,
    },
    {
      name: "Crisp Red Fuji Apples (1kg Bag)",
      slug: "crisp-red-fuji-apples",
      price: 490,
      stock: 75,
      status: ProductStatus.ACTIVE,
      categorySlug: "fresh-produce",
      imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80",
      description: "Hand-picked sweet and crunchy premium Fuji apples. Chilled immediately post-harvest to preserve crispness and natural hydration.",
      dealType: null,
      isDealActive: false,
      isFeatured: false,
    },
    {
      name: "Smart Digital Electric Kettle 1.7L",
      slug: "smart-digital-electric-kettle",
      price: 3600,
      stock: 22,
      status: ProductStatus.ACTIVE,
      categorySlug: "home-kitchen",
      imageUrl: "https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=800&q=80",
      description: "Precision temperature preset controller with double-wall stainless steel insulation and rapid boil 2200W heating element.",
      dealType: DealType.WEEKLY,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isFeatured: true,
    },
    {
      name: "Habesha Handwoven Pure Cotton Scarf (Netela)",
      slug: "habesha-handwoven-cotton-scarf",
      price: 1850,
      stock: 35,
      status: ProductStatus.ACTIVE,
      categorySlug: "fashion",
      imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80",
      description: "Elegantly handwoven by master Ethiopian artisans using 100% fine spun cotton with vibrant Tibeb embroidered border patterns.",
      dealType: DealType.CEREMONY,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      isFeatured: true,
    },
    {
      name: "Extra Virgin Cold-Pressed Olive Oil (750ml)",
      slug: "olive-oil",
      price: 1450,
      stock: 38,
      status: ProductStatus.ACTIVE,
      categorySlug: "groceries",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80",
      description: "First cold-pressed single-origin extra virgin olive oil with rich fruity aroma and balanced peppery finish.",
      dealType: null,
      isDealActive: false,
      isFeatured: false,
    },
    {
      name: "JBL Charge 5 Portable Waterproof Bluetooth Speaker",
      slug: "jbl-charge-5",
      price: 11200,
      stock: 16,
      status: ProductStatus.ACTIVE,
      categorySlug: "electronics",
      imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
      description: "IP67 waterproof and dustproof speaker delivering bold JBL Original Pro Sound with built-in powerbank and 20 hours of playtime.",
      dealType: DealType.WEEKLY,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      isFeatured: true,
    },
    {
      name: "Philips Compact Rapid Air Fryer (4.1L)",
      slug: "philips-rapid-air-fryer",
      price: 8900,
      stock: 14,
      status: ProductStatus.ACTIVE,
      categorySlug: "home-kitchen",
      imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80",
      description: "Crispy fried food with up to 90% less oil thanks to patented Rapid Air technology. 12-in-1 presets for baking, grilling, and roasting.",
      dealType: DealType.CLEARANCE,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isFeatured: true,
    },
    {
      name: "Organic Shea & Cocoa Whipped Body Butter (250ml)",
      slug: "organic-shea-body-butter",
      price: 580,
      stock: 45,
      status: ProductStatus.ACTIVE,
      categorySlug: "beauty-personal-care",
      imageUrl: "https://images.unsplash.com/photo-1608248597359-597561f93fbe?w=800&q=80",
      description: "Deeply moisturizing whipped body butter packed with raw African shea, virgin coconut oil, and vitamin E. Free of parabens and sulfates.",
      dealType: null,
      isDealActive: false,
      isFeatured: false,
    },
    {
      name: "Premium Ethiopian White Teff Flour (5kg)",
      slug: "premium-ethiopian-teff-flour",
      price: 650,
      stock: 80,
      status: ProductStatus.ACTIVE,
      categorySlug: "groceries",
      imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80",
      description: "Finely ground Magna White Teff harvested in Gojjam. Naturally gluten-free, rich in iron, calcium, and prebiotics for authentic spongy Injera.",
      dealType: null,
      isDealActive: false,
      isFeatured: true,
    },
    {
      name: "Fresh Shola Whole Cow Milk (1L)",
      slug: "fresh-shola-whole-milk",
      price: 110,
      stock: 120,
      status: ProductStatus.ACTIVE,
      categorySlug: "dairy-and-eggs",
      imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
      description: "100% pasteurized fresh whole milk with natural creaminess. Sourced daily from local Ethiopian dairy cooperatives.",
      dealType: null,
      isDealActive: false,
      isFeatured: false,
    },
    {
      name: "Traditional Spicy Berbere Blend (500g)",
      slug: "traditional-spicy-berbere-blend",
      price: 450,
      stock: 95,
      status: ProductStatus.ACTIVE,
      categorySlug: "groceries",
      imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
      description: "Sun-dried red peppers stone-ground with garlic, ginger, rue, and fenugreek. Fragrant, robust, and deep crimson color.",
      dealType: DealType.DAILY,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      isFeatured: false,
    },
    {
      name: "Raw Organic Chia Seeds (500g)",
      slug: "raw-organic-chia-seeds",
      price: 420,
      stock: 55,
      status: ProductStatus.ACTIVE,
      categorySlug: "health-fitness",
      imageUrl: "https://images.unsplash.com/photo-1584365685547-9a5fb6f3a70c?w=800&q=80",
      description: "Powerhouse of Omega-3 fatty acids, dietary fiber, and plant protein. Mix into smoothies, yogurt parfaits, or oat bowls.",
      dealType: null,
      isDealActive: false,
      isFeatured: false,
    },
    {
      name: "Commercial-Grade High-Speed Blender 1500W",
      slug: "commercial-high-speed-blender",
      price: 6800,
      stock: 12,
      status: ProductStatus.ACTIVE,
      categorySlug: "home-kitchen",
      imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80",
      description: "Industrial 6-blade hardened stainless steel cutter crushing ice, nuts, and frozen fruit in seconds. 2L BPA-free pitcher.",
      dealType: DealType.WEEKLY,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      isFeatured: false,
    },
    {
      name: "Specialty Sidama Medium-Roast Coffee (500g)",
      slug: "sidama-medium-roast-coffee",
      price: 890,
      stock: 50,
      status: ProductStatus.ACTIVE,
      categorySlug: "coffee-tea",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
      description: "Smooth body with milk chocolate, red berry, and subtle spice notes. Roasted fresh weekly in small batches in Addis Ababa.",
      dealType: null,
      isDealActive: false,
      isFeatured: false,
    },
    {
      name: "Natural Aloe Vera Botanical Shampoo (400ml)",
      slug: "natural-aloe-vera-shampoo",
      price: 360,
      stock: 60,
      status: ProductStatus.ACTIVE,
      categorySlug: "beauty-personal-care",
      imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80",
      description: "Gentle scalp-nourishing shampoo formulated with pure aloe barbadensis and rosemary essential oil for resilient hair luster.",
      dealType: null,
      isDealActive: false,
      isFeatured: false,
    },
    {
      name: "Artisanal French Butter Croissants (Pack of 4)",
      slug: "french-butter-croissants",
      price: 380,
      stock: 30,
      status: ProductStatus.ACTIVE,
      categorySlug: "bakery",
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
      description: "Flaky, multilayered laminated pastry made with pure creamery butter. Golden, airy, and delicately fragrant.",
      dealType: DealType.DAILY,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      isFeatured: false,
    },
    {
      name: "Fresh Sweet Ethiopian Strawberries (500g Box)",
      slug: "fresh-sweet-strawberries",
      price: 340,
      stock: 45,
      status: ProductStatus.ACTIVE,
      categorySlug: "fresh-produce",
      imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80",
      description: "Ruby-red sweet strawberries grown in greenhouse clusters in Debre Zeit. Fragrant, juicy, and packed with vitamin C.",
      dealType: null,
      isDealActive: false,
      isFeatured: true,
    },
    {
      name: "Stainless Steel Double-Wall Thermal Flask (1L)",
      slug: "stainless-thermal-flask",
      price: 1250,
      stock: 40,
      status: ProductStatus.ACTIVE,
      categorySlug: "home-kitchen",
      imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
      description: "Vacuum insulated flask keeping beverages piping hot for 18 hours or ice cold for 24 hours. Leakproof twist lid.",
      dealType: null,
      isDealActive: false,
      isFeatured: false,
    },
    {
      name: "Eco-Friendly Concentrated Laundry Detergent (2L)",
      slug: "eco-friendly-laundry-detergent",
      price: 680,
      stock: 55,
      status: ProductStatus.ACTIVE,
      categorySlug: "home-kitchen",
      imageUrl: "https://images.unsplash.com/photo-1585670270608-b404fb8809fb?w=800&q=80",
      description: "Plant-powered bio-enzymatic formula tough on grass and grease stains yet gentle on sensitive skin and fabrics.",
      dealType: null,
      isDealActive: false,
      isFeatured: false,
    },
    {
      name: "Breathable Lightweight Running Sneakers",
      slug: "lightweight-running-sneakers",
      price: 4200,
      stock: 20,
      status: ProductStatus.ACTIVE,
      categorySlug: "fashion",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      description: "High-cushion responsive foam running shoe engineered for road jogging and urban walking. Breathable mesh upper.",
      dealType: DealType.CLEARANCE,
      isDealActive: true,
      dealStartAt: new Date(),
      dealEndAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isFeatured: true,
    },
  ];

  const createdProductsMap: Record<string, any> = {};

  for (const item of productsData) {
    const category = categoriesMap[item.categorySlug];
    if (!category) continue;

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        price: item.price,
        stock: item.stock,
        status: item.status,
        imageUrl: item.imageUrl,
        description: item.description,
        dealType: item.dealType,
        isDealActive: item.isDealActive,
        dealStartAt: item.dealStartAt,
        dealEndAt: item.dealEndAt,
        isFeatured: item.isFeatured,
        categoryId: category.id,
      },
      create: {
        name: item.name,
        slug: item.slug,
        price: item.price,
        stock: item.stock,
        status: item.status,
        imageUrl: item.imageUrl,
        description: item.description,
        dealType: item.dealType,
        isDealActive: item.isDealActive,
        dealStartAt: item.dealStartAt,
        dealEndAt: item.dealEndAt,
        isFeatured: item.isFeatured,
        categoryId: category.id,
      },
    });

    createdProductsMap[item.slug] = product;
  }

  // 6. Seed Discount Coupons
  const couponsData = [
    { code: "WELCOME10", discountPercent: 10, isActive: true },
    { code: "MEBA15", discountPercent: 15, isActive: true },
    { code: "SUPERDEAL", discountPercent: 20, isActive: true },
    { code: "FREESHIP", discountPercent: 5, isActive: true },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        discountPercent: c.discountPercent,
        isActive: c.isActive,
      },
      create: {
        code: c.code,
        discountPercent: c.discountPercent,
        isActive: c.isActive,
      },
    });
  }

  // 7. Seed Customer Orders (Historical & Active)
  const coffeeProduct = createdProductsMap["ethiopian-specialty-coffee"];
  const honeyProduct = createdProductsMap["organic-highland-honey"];
  const avocadosProduct = createdProductsMap["fresh-hass-avocados"];
  const breadProduct = createdProductsMap["artisanal-sourdough-bread"];
  const eggsProduct = createdProductsMap["free-range-farm-eggs"];
  const kettleProduct = createdProductsMap["smart-digital-electric-kettle"];

  // Order 1: Delivered (5 days ago)
  if (coffeeProduct && honeyProduct && eggsProduct) {
    const existingOrder1 = await prisma.order.findFirst({
      where: { userId: customer.id, status: OrderStatus.DELIVERED },
    });

    if (!existingOrder1) {
      const order1Total = 950 * 2 + 820 * 1 + 750 * 1;
      await prisma.order.create({
        data: {
          userId: customer.id,
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          totalAmount: order1Total,
          shippingName: "Sarah Jenkins",
          shippingAddress: "Bole Subcity, Woreda 03, House 42",
          shippingCity: "Addis Ababa",
          shippingZip: "1000",
          shippingCountry: "Ethiopia",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          items: {
            create: [
              { productId: coffeeProduct.id, quantity: 2, unitPrice: 950 },
              { productId: honeyProduct.id, quantity: 1, unitPrice: 820 },
              { productId: eggsProduct.id, quantity: 1, unitPrice: 750 },
            ],
          },
        },
      });
    }
  }

  // Order 2: Out for Delivery / Shipped (Yesterday)
  if (kettleProduct && breadProduct) {
    const existingOrder2 = await prisma.order.findFirst({
      where: { userId: customer.id, status: OrderStatus.SHIPPED },
    });

    if (!existingOrder2) {
      const order2Total = 3600 * 1 + 320 * 2;
      await prisma.order.create({
        data: {
          userId: customer.id,
          status: OrderStatus.SHIPPED,
          paymentStatus: PaymentStatus.PAID,
          totalAmount: order2Total,
          shippingName: "Sarah Jenkins",
          shippingAddress: "Bole Subcity, Woreda 03, House 42",
          shippingCity: "Addis Ababa",
          shippingZip: "1000",
          shippingCountry: "Ethiopia",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          items: {
            create: [
              { productId: kettleProduct.id, quantity: 1, unitPrice: 3600 },
              { productId: breadProduct.id, quantity: 2, unitPrice: 320 },
            ],
          },
        },
      });
    }
  }

  // Order 3: Confirmed / Packed (Today)
  if (avocadosProduct && breadProduct) {
    const existingOrder3 = await prisma.order.findFirst({
      where: { userId: customer.id, status: OrderStatus.PACKED },
    });

    if (!existingOrder3) {
      const order3Total = 280 * 2 + 320 * 1;
      await prisma.order.create({
        data: {
          userId: customer.id,
          status: OrderStatus.PACKED,
          paymentStatus: PaymentStatus.UNPAID,
          totalAmount: order3Total + 100, // include standard shipping
          shippingName: "Sarah Jenkins",
          shippingAddress: "Kazanchis, Commercial Tower 5th Floor",
          shippingCity: "Addis Ababa",
          shippingZip: "1000",
          shippingCountry: "Ethiopia",
          createdAt: new Date(),
          items: {
            create: [
              { productId: avocadosProduct.id, quantity: 2, unitPrice: 280 },
              { productId: breadProduct.id, quantity: 1, unitPrice: 320 },
            ],
          },
        },
      });
    }
  }

  // 8. Seed Customer Wishlist Items
  if (coffeeProduct && kettleProduct) {
    await prisma.wishlistItem.deleteMany({ where: { userId: customer.id } });
    await prisma.wishlistItem.createMany({
      data: [
        { userId: customer.id, productId: coffeeProduct.id, quantity: 1 },
        { userId: customer.id, productId: kettleProduct.id, quantity: 1 },
      ],
      skipDuplicates: true,
    });
  }

  // 9. Seed Community Customer Reviews
  const reviewsSeedData = [
    {
      productSlug: "ethiopian-specialty-coffee",
      user: customer,
      rating: 5,
      comment: "Absolutely outstanding coffee. The floral jasmine aroma when brewing with V60 fills the whole kitchen. Truly authentic Yirgacheffe!",
    },
    {
      productSlug: "ethiopian-specialty-coffee",
      user: dawit,
      rating: 5,
      comment: "Fresh roast date and perfectly balanced acidity. Pairs exquisitely with morning breakfast. Will definitely reorder in bulk.",
    },
    {
      productSlug: "organic-highland-honey",
      user: customer,
      rating: 5,
      comment: "Thick, rich, and raw. You can immediately taste the wild forest botanical nectar. Excellent natural remedy for winter colds.",
    },
    {
      productSlug: "wireless-headphones",
      user: dawit,
      rating: 5,
      comment: "The active noise cancellation is unmatched in Addis commuter traffic. Battery lasts almost the entire work week without charging.",
    },
    {
      productSlug: "smart-digital-electric-kettle",
      user: customer,
      rating: 4,
      comment: "Heats up water remarkably fast and the digital temperature presets for green vs black tea are super handy.",
    },
    {
      productSlug: "fresh-hass-avocados",
      user: dawit,
      rating: 5,
      comment: "Fresh, ripe, and creamy. None of them had brown spots inside. Great quality control by Meba Supermarket.",
    },
    {
      productSlug: "artisanal-sourdough-bread",
      user: customer,
      rating: 5,
      comment: "Crispy crust and chewy airy inside. Made the best avocado toast ever. Arrived warm!",
    },
  ];

  for (const r of reviewsSeedData) {
    const prod = createdProductsMap[r.productSlug];
    if (!prod) continue;

    const existing = await prisma.review.findFirst({
      where: { productId: prod.id, userId: r.user.id },
    });

    if (!existing) {
      await prisma.review.create({
        data: {
          productId: prod.id,
          userId: r.user.id,
          rating: r.rating,
          comment: r.comment,
          status: ReviewStatus.APPROVED,
        },
      });
    }
  }

  // 10. Seed Community Q&A with Store Staff Answers
  const qaSeedData = [
    {
      productSlug: "ethiopian-specialty-coffee",
      asker: customer,
      question: "Are these beans whole or pre-ground?",
      answer: "These are whole roasted beans to preserve maximum aroma and freshness. You can request custom grinding at our bakery counter if desired!",
    },
    {
      productSlug: "organic-highland-honey",
      asker: dawit,
      question: "Is this honey 100% raw and unfiltered?",
      answer: "Yes, our forest honey is cold-extracted and never heated or micro-filtered, preserving all live pollen, propolis, and enzymes.",
    },
    {
      productSlug: "artisanal-sourdough-bread",
      asker: customer,
      question: "What is the typical shelf life of this sourdough?",
      answer: "Because it is naturally fermented with sourdough starter, it stays fresh for 4 to 5 days at room temperature, or up to 3 months sliced in the freezer.",
    },
  ];

  for (const qa of qaSeedData) {
    const prod = createdProductsMap[qa.productSlug];
    if (!prod) continue;

    const existingQ = await prisma.question.findFirst({
      where: { productId: prod.id, text: qa.question },
    });

    if (!existingQ) {
      const q = await prisma.question.create({
        data: {
          productId: prod.id,
          userId: qa.asker.id,
          text: qa.question,
          status: ReviewStatus.APPROVED,
        },
      });

      await prisma.answer.create({
        data: {
          questionId: q.id,
          userId: admin.id,
          text: qa.answer,
        },
      });
    }
  }

  // 11. Seed Customer Inbox Messages
  await prisma.inboxMessage.deleteMany({ where: { userId: customer.id } });
  await prisma.inboxMessage.createMany({
    data: [
      {
        userId: customer.id,
        sender: "Meba Customer Care",
        subject: "Welcome to Meba Supermarket VIP Rewards!",
        body: "Thank you for joining Meba Supermarket. Enjoy 10% off your first checkout using code WELCOME10, and free delivery on orders over 1,000 ETB.",
        read: true,
        category: MessageCategory.SUPPORT,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: customer.id,
        sender: "Meba Logistics",
        subject: "Your order is dispatched for delivery",
        body: "Great news! Your recent shipment is now in transit with our courier driver across Bole Subcity. Expected delivery window: 2:00 PM - 5:00 PM today.",
        read: false,
        category: MessageCategory.SALES,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        userId: customer.id,
        sender: "Meba Promotions",
        subject: "Exclusive Weekend Deal: 15% off Fresh Bakery",
        body: "This weekend only: use coupon code MEBA15 to save 15% across our entire fresh bakery and artisanal sourdough selections.",
        read: false,
        category: MessageCategory.PROMOTIONS,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    ],
  });

  console.log(`✅ Seeded admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
  console.log(`✅ Seeded customer: ${DEFAULT_CUSTOMER_EMAIL} / ${DEFAULT_CUSTOMER_PASSWORD}`);
  console.log(`✅ Seeded secondary customer: ${SECONDARY_CUSTOMER_EMAIL} / ${SECONDARY_CUSTOMER_PASSWORD}`);
  console.log(`✅ Seeded ${productsData.length} products with photography, deals, and descriptions.`);
  console.log(`✅ Seeded ${couponsData.length} active coupons.`);
  console.log(`✅ Seeded customer orders, delivery addresses, wishlist items, and inbox messages.`);
  console.log(`✅ Seeded community reviews and verified Q&A.`);
  console.log("🎉 Seeding complete successfully!");
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
