export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Para o servidor
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
} 