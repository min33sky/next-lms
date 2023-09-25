import { z } from 'zod';

const environment = z.object({
  NEXT_PUBLIC_APP_URL: z.string(),
  UPLOADTHING_SECRET: z.string(),
  UPLOADTHING_APP_ID: z.string(),
  MUX_TOKEN_ID: z.string(),
  MUX_TOKEN_SECRET: z.string(),
  STRIPE_API_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  NEXT_PUBLIC_TEACHER_ID: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof environment> {}
  }
}
