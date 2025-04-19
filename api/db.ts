import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

const {
    PGHOST,
    PGDATABASE,
    PGUSER,
    PGPASSWORD
} = process.env;

if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
    throw new Error("Missing PostgreSQL environment variables.");
}

const sql = postgres({
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: 'require'
});

export default sql;