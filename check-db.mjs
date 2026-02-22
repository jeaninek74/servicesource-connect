import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [resources] = await connection.execute('SELECT COUNT(*) as count FROM resources');
const [lenders] = await connection.execute('SELECT COUNT(*) as count FROM lenders');
const [categories] = await connection.execute('SELECT COUNT(*) as count FROM resource_categories');

console.log('Resources:', resources[0].count);
console.log('Lenders:', lenders[0].count);
console.log('Categories:', categories[0].count);

await connection.end();
process.exit(0);
