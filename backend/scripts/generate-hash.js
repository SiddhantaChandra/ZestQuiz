const bcrypt = require('bcrypt');

async function generateHash(password) {
  const hash = await bcrypt.hash(password, 10);
  const timestamp = new Date().toISOString();
  
  console.log('\n=== User Creation Data ===');
  console.log(`Password: ${password}`);
  console.log(`Hashed: ${hash}`);
  console.log(`Timestamp: ${timestamp}`);
  
  console.log('\n=== Ready to Use SQL ===');
  console.log(`INSERT INTO "User" (email, username, password, role, "createdAt", "updatedAt")`);
  console.log(`VALUES (`);
  console.log(`  'example@zestquiz.com',`);
  console.log(`  'username',`);
  console.log(`  '${hash}',`);
  console.log(`  'ADMIN',`);
  console.log(`  '${timestamp}',`);
  console.log(`  '${timestamp}'`);
  console.log(`);\n`);
}

console.log('Generating hashes and SQL statements...\n');

// Generate hashes for admin and user passwords
Promise.all([
  generateHash('Admin@123'),
  generateHash('User@123')
]).then(() => {
  console.log('Done! Copy the SQL statements above to create users in the database.');
}); 