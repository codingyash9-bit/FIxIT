// This script is intentionally broken for testing Fixit CLI
const fs = require('fs');

console.log("Attempting to read a sensitive system file...");

// BUG: Missing 'path' variable and incorrect function usage
const data = fs.readFileSync(nonExistentPath); 

console.log("Data read successfully:", data);
