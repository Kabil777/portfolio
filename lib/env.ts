function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function secret(name: string): string {
  const value = required(name);
  if (value.length < 32)
    throw new Error(`${name} must be at least 32 characters`);
  return value;
}

export function databaseEnv() {
  return { databaseUrl: required("DATABASE_URL") };
}

export function securityEnv() {
  return {
    sessionSecret: secret("SESSION_SECRET"),
    analyticsSecret: secret("ANALYTICS_SECRET"),
  };
}

export function resendEnv() {
  return {
    apiKey: required("RESEND_API_KEY"),
    segmentId: required("RESEND_SEGMENT_ID"),
    webhookSecret: required("RESEND_WEBHOOK_SECRET"),
  };
}
