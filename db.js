import pkg from 'pg';
const {Pool} = pkg;
import config from 'dotenv';

const pool = new Pool({
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DBPORT,
    database: 'todoapp'
})

export default pool;
//module.exports = pool;