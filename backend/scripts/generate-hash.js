/**
 * Generates bcrypt hash for seed data.
 * Run: node scripts/generate-hash.js
 * Use the output in db/seed.sql for authentication password_hash values.
 */
const bcrypt = require("bcrypt");
const password = "password123";
const hash = bcrypt.hashSync(password, 10);
console.log("bcrypt hash for", password, ":");
console.log(hash);
