/**
 * Database Seeder
 * Creates sample users and financial records for testing/development.
 *
 * Usage: npm run seed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Rental Income', 'Bonus', 'Dividends'],
  expense: ['Rent', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Shopping', 'Insurance', 'Subscriptions'],
};

function randomAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(monthsBack = 12) {
  const now = new Date();
  const past = new Date();
  past.setMonth(past.getMonth() - monthsBack);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();
  console.log('   Cleaned existing data.');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Analyst User',
      email: 'analyst@example.com',
      password: hashedPassword,
      role: 'ANALYST',
      isActive: true,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: 'Viewer User',
      email: 'viewer@example.com',
      password: hashedPassword,
      role: 'VIEWER',
      isActive: true,
    },
  });

  const inactiveUser = await prisma.user.create({
    data: {
      name: 'Inactive User',
      email: 'inactive@example.com',
      password: hashedPassword,
      role: 'VIEWER',
      isActive: false,
    },
  });

  console.log('   ✅ Created 4 users:');
  console.log(`      Admin    : admin@example.com    (password: password123)`);
  console.log(`      Analyst  : analyst@example.com   (password: password123)`);
  console.log(`      Viewer   : viewer@example.com    (password: password123)`);
  console.log(`      Inactive : inactive@example.com  (password: password123)`);

  // Create financial records
  const descriptions = {
    Salary: ['Monthly salary', 'Bi-weekly payment', 'Salary deposit'],
    Freelance: ['Web development project', 'Consulting work', 'Design contract'],
    Investments: ['Stock dividends', 'Mutual fund returns', 'Bond interest'],
    'Rental Income': ['Apartment rent received', 'Office space rental'],
    Bonus: ['Performance bonus', 'Annual bonus', 'Referral bonus'],
    Dividends: ['Quarterly dividends', 'Annual dividend payment'],
    Rent: ['Monthly apartment rent', 'Office space rent'],
    Food: ['Weekly groceries', 'Restaurant dining', 'Food delivery'],
    Transportation: ['Gas/fuel', 'Monthly transit pass', 'Uber rides', 'Car maintenance'],
    Utilities: ['Electricity bill', 'Water bill', 'Internet bill', 'Phone bill'],
    Entertainment: ['Movie tickets', 'Concert', 'Streaming subscriptions', 'Gaming'],
    Healthcare: ['Doctor visit', 'Medication', 'Dental checkup', 'Health insurance'],
    Education: ['Online course', 'Books', 'Workshop fee', 'Certification exam'],
    Shopping: ['Clothing', 'Electronics', 'Home essentials', 'Gifts'],
    Insurance: ['Health insurance premium', 'Car insurance', 'Life insurance'],
    Subscriptions: ['Software subscription', 'Magazine', 'Gym membership'],
  };

  const records = [];
  for (let i = 0; i < 50; i++) {
    const type = Math.random() > 0.4 ? 'EXPENSE' : 'INCOME';
    const category = randomChoice(
      type === 'INCOME' ? CATEGORIES.income : CATEGORIES.expense
    );
    const amount =
      type === 'INCOME' ? randomAmount(500, 15000) : randomAmount(10, 3000);
    const desc = randomChoice(descriptions[category] || ['Financial transaction']);

    records.push({
      amount,
      type,
      category,
      date: randomDate(12),
      description: desc,
      createdById: admin.id,
    });
  }

  await prisma.financialRecord.createMany({ data: records });
  console.log(`   ✅ Created 50 financial records.`);

  // Print summary
  const incomeTotal = records
    .filter((r) => r.type === 'INCOME')
    .reduce((sum, r) => sum + r.amount, 0);
  const expenseTotal = records
    .filter((r) => r.type === 'EXPENSE')
    .reduce((sum, r) => sum + r.amount, 0);

  console.log(`\n📊 Summary:`);
  console.log(`   Income records  : ${records.filter((r) => r.type === 'INCOME').length}`);
  console.log(`   Expense records : ${records.filter((r) => r.type === 'EXPENSE').length}`);
  console.log(`   Total income    : $${incomeTotal.toFixed(2)}`);
  console.log(`   Total expenses  : $${expenseTotal.toFixed(2)}`);
  console.log(`   Net balance     : $${(incomeTotal - expenseTotal).toFixed(2)}`);

  console.log('\n✅ Seeding complete!\n');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
