import { z } from "zod";

const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url()
    .describe("Supabase project URL (Dashboard → Settings → API)"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(10)
    .describe("Supabase anon public key (Dashboard → Settings → API)")
});

export type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;

let cachedEnv: SupabaseEnv | null = null;
let validationError: Error | null = null;

export function getSupabaseEnv(): SupabaseEnv {
  if (cachedEnv) return cachedEnv;
  if (validationError) throw validationError;

  const parsed = supabaseEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });

  if (!parsed.success) {
    const missingVars = parsed.error.issues
      .filter((issue) => issue.code === "invalid_type" || issue.code === "too_small")
      .map((issue) => issue.path[0])
      .join(", ");

    const errorMessageLines = [
      "Supabase configuration is invalid or missing.",
      "",
      "Required environment variables:",
      "  - NEXT_PUBLIC_SUPABASE_URL",
      "  - NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "",
      "Create a .env.local file in the project root with:",
      "  NEXT_PUBLIC_SUPABASE_URL=your-project-url",
      "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key",
      "",
      missingVars
        ? `Missing or invalid: ${missingVars}`
        : "Check values in your .env.local file.",
      "",
      "See Supabase dashboard → Settings → API for the correct values."
    ];

    validationError = new Error(errorMessageLines.join("\n"));
    throw validationError;
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

