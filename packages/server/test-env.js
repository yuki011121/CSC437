// test-env.js
require('dotenv').config();

console.log('--- Testing .env file ---');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('TOKEN_SECRET:', process.env.TOKEN_SECRET);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
console.log('--- End of Test ---');