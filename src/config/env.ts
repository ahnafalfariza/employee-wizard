const getEnv = (key: string, fallback: string): string =>
  (import.meta.env[key] as string | undefined) ?? fallback;

export const API_STEP1_URL = getEnv('VITE_API_STEP1_URL', 'http://localhost:4001');
export const API_STEP2_URL = getEnv('VITE_API_STEP2_URL', 'http://localhost:4002');
