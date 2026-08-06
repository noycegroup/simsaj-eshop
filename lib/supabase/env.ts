function requireEnvironmentVariable(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Chýba premenná prostredia ${name}.`);
  }

  return value;
}

export function getSupabaseEnvironment() {
  return {
    url: requireEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: requireEnvironmentVariable(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
  };
}
