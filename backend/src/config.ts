function readPort(value: string | undefined): number {
  const parsed = Number(value ?? "3000");

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return parsed;
}

export const config = {
  host: process.env.HOST ?? "127.0.0.1",
  port: readPort(process.env.PORT),
  environment: process.env.NODE_ENV ?? "development"
} as const;
