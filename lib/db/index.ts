import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from "@neondatabase/serverless" 

import * as schema from './schema'

// sql connection thru neon
const sql = neon(process.env.DATABASE_URL!)

//drizzle queries 
export const db = drizzle(sql, {schema})
// raw sql queries
export {sql}
