import axios from "axios";
import { getAuth } from "firebase/auth";

// Define the base URL for the backend
const BASE_URL = "http://localhost:8000/api";

// Create an Axios instance with a base URL
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10-second timeout for API requests
});

// Helper function to get the current user's ID token
const getIdToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }
    return user.getIdToken(true); // Force refresh if needed
};

// Helper function to add auth headers to requests
const authHeader = async () => {
    const token = await getIdToken();
    return {
        Authorization: `Bearer ${token}`,
    };
};

const api = {
    auth: {
        getProfile: async () => {
            const headers = await authHeader();
            return apiClient.get("/auth/profile", { headers });
        },
        updateProfile: async (data: any) => { /** TODO Find out a type for data */
            const headers = await authHeader();
            return apiClient.put("/auth/profile", data, { headers });
        },
        initializeUserProfile: async (userData: any) => { /** TODO Find out a type for data */
            const headers = await authHeader();
            return apiClient.put("/auth/profile", userData, { headers });
        },
    },
    stocks: {
        search: (query: string = "") => {
            return axios.get(`http://localhost:8000/api/stocks`);
        },
        getStock: (symbol: string) => axios.get(`http://localhost:8000/api/stocks/${symbol}`),
        getHistory: (symbol: string, days: number) => axios.get(`http://localhost:8000/api/stocks/${symbol}/history?days=${days}`),
        getCompanyInfo: (symbol: string) => axios.get(`http://localhost:8000/api/stocks/${symbol}/company-info`),
        getRecommendation: (symbol: string) => axios.get(`http://localhost:8000/api/stocks/${symbol}/recommendation`), //
    },

    /*
    portfolios: {
        create: async (data) => {
            const headers = await authHeader();
            return apiClient.post("/portfolios", data, { headers });
        },
        getAll: async () => {
            const headers = await authHeader();
            return apiClient.get("/portfolios", { headers });
        },
        get: async (id) => {
            const headers = await authHeader();
            return apiClient.get(`/portfolios/${id}`, { headers });
        },
        update: async (id, data) => {
            const headers = await authHeader();
            return apiClient.put(`/portfolios/${id}`, data, { headers });
        },
        delete: async (id) => {
            const headers = await authHeader();
            return apiClient.delete(`/portfolios/${id}`, { headers });
        },
        compare: async (ids) => {
            const headers = await authHeader();
            return apiClient.get(`/portfolios/compare?ids=${ids.join(",")}`, { headers });
        },
    },
    trading: {
        buy: async (portfolioId, data) => {
            const headers = await authHeader();
            return apiClient.post(`/portfolios/${portfolioId}/buy`, data, { headers });
        },
        sell: async (portfolioId, data) => {
            const headers = await authHeader();
            return apiClient.post(`/portfolios/${portfolioId}/sell`, data, { headers });
        },
        getTransactions: async (portfolioId) => {
            const headers = await authHeader();
            return apiClient.get(`/portfolios/${portfolioId}/transactions`, { headers });
        },
        getPerformance: async (portfolioId) => {
            const headers = await authHeader();
            return apiClient.get(`/portfolios/${portfolioId}/performance`, { headers });
        },
    },
    education: {
        getTerms: () => apiClient.get("/education/terms"),
        getTerm: (term: string) => apiClient.get(`/education/terms/${term}`),
        getTips: () => apiClient.get("/education/tips"),
    },
    */
};

export default api;
