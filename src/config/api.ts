// URLs base da API
const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.futuree.org'
  : 'https://dev-api.futuree.org';

export const API_URLS = {
  createCheckoutSession: `${BASE_URL}/createCheckoutSession`,
}; 