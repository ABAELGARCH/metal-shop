import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12)
  const admin = await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@metalshop.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@metalshop.com',
      password: hashed,
      name: process.env.ADMIN_NAME || 'Store Admin',
    },
  })
  console.log('Admin user:', admin.email)

  // Categories
  const catSigns = await prisma.category.upsert({
    where: { slug: 'metal-signs' },
    update: {},
    create: { name: 'Metal Signs', slug: 'metal-signs', sortOrder: 1 },
  })
  const catWall = await prisma.category.upsert({
    where: { slug: 'wall-art' },
    update: {},
    create: { name: 'Wall Art', slug: 'wall-art', sortOrder: 2 },
  })
  console.log('Categories created:', catSigns.name, catWall.name)

  // Sample product
  const product = await prisma.product.upsert({
    where: { slug: 'custom-metal-name-sign' },
    update: {},
    create: {
      name: 'Custom Metal Name Sign',
      slug: 'custom-metal-name-sign',
      description: 'Laser-cut steel sign personalized with your name or message. Powder-coated finish. Built to last a lifetime.',
      price: 4999,       // $49.99
      compareAtPrice: 6999, // $69.99
      published: true,
      featured: true,
      sortOrder: 1,
      categoryId: catSigns.id,
      customizationConfig: {
        zones: [
          {
            id: 'line1',
            label: 'Your Text',
            x: 400,
            y: 300,
            maxWidth: 700,
            maxChars: 20,
            font: 'Impact',
            fontSize: 80,
            color: '#F5A623',
            defaultText: 'YOUR NAME',
            uppercase: true,
          },
        ],
      },
      images: {
        create: [
          {
            url: '/placeholder/product-sign.jpg',
            altText: 'Custom Metal Name Sign',
            sortOrder: 0,
            isBase: true,
          },
        ],
      },
    },
  })
  console.log('Product created:', product.name)

  // Settings
  await prisma.setting.upsert({
    where: { key: 'store_name' },
    update: {},
    create: { key: 'store_name', value: '"FORGE METAL SHOP"' },
  })
  await prisma.setting.upsert({
    where: { key: 'shipping_cost' },
    update: {},
    create: { key: 'shipping_cost', value: '999' }, // $9.99 flat
  })
  await prisma.setting.upsert({
    where: { key: 'tax_rate' },
    update: {},
    create: { key: 'tax_rate', value: '0' }, // 0%
  })

  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
