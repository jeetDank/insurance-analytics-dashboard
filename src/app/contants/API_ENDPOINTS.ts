// api-constants.ts
export const BASE_URL = 'http://localhost:8000/api/v1'; // Set your API base URL here (e.g., 'http://localhost:8080/api/v1')

// API Endpoints
export const API_ENDPOINTS = {
 
   
    QUERY:"/query/parse",
    COMAPANIES:"/companies/resolve",
    ANALYSE_BATCH:"/analysis/batch",
    AMBIGUITY_RESOLVE:"/ambiguities/resolve",

} as const;

