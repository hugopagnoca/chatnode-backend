import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file into process.env
console.log('[ENV] Loading environment variables...');
dotenv.config();
console.log('[ENV] NODE_ENV:', process.env.NODE_ENV);
console.log('[ENV] PORT:', process.env.PORT);
console.log('[ENV] JWT_SECRET:', process.env.JWT_SECRET ? '***SET***' : 'MISSING');
console.log('[ENV] DATABASE_URL:', process.env.DATABASE_URL ? '***SET***' : 'MISSING');
console.log('[ENV] CORS_ORIGIN:', process.env.CORS_ORIGIN);

/**
 * Environment variable schema with validation rules
 *
 * Why use Zod here?
 * - Catches missing or invalid environment variables at startup
 * - Self-documenting (you can see all required config in one place)
 * - Type-safe: TypeScript knows the exact shape of your config
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server configuration
  PORT: z.string().default('3000').transform(Number),  // Convert string to number

  // JWT configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
  JWT_EXPIRES_IN: z.string().default('7d'),  // 7 days

  // Database
  DATABASE_URL: z.string().default('file:./dev.db'),  // SQLite file path

  // CORS (which origins can access your API)
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

/**
 * Parse and validate environment variables
 *
 * If validation fails, Zod throws an error with details about what's wrong
 * This happens at startup, so you catch config errors immediately
 */
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(JSON.stringify(error.issues, null, 2));
      process.exit(1);  // Exit the application - can't run with bad config
    }
    throw error;
  }
};

// Export the validated config
export const env = parseEnv();

// Log CORS config in production for debugging
if (env.NODE_ENV === 'production') {
  console.log('[ENV] CORS_ORIGIN:', env.CORS_ORIGIN);
}

// Export the type so other files know the shape
export type Env = z.infer<typeof envSchema>;
