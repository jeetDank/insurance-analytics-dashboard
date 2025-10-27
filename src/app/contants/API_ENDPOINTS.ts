// api-constants.ts
export const BASE_URL = 'http://localhost:8000'; // Set your API base URL here (e.g., 'http://localhost:8080/api/v1')

// API Endpoints
export const API_ENDPOINTS = {
 
   
    QUERY:"/api/v1/query/parse",
    COMAPANIES:"/api/v1/companies/resolve",
    ANALYSE_BATCH:"/api/v1/analysis/batch"

} as const;

