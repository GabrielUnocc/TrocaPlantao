import { migrate } from '../src/db/index.js';
import { env } from '../src/config/env.js';

migrate();
console.log(`Schema aplicado em ${env.DATABASE_FILE}`);
