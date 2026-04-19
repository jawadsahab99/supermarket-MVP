import axios from 'axios';

const API_URL = 'https://supermarket-mvp.onrender.com/api';

export const searchProducts = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/search`, { params: { q: query } });
        return response.data;
    } catch (error) {
        console.error("Error fetching products", error);
        return [];
    }
};

export const adminLogin = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/admin/login`, { username, password });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Login failed");
    }
};

// Generic API caller for admin endpoints
export const adminApi = {
    get: async (endpoint) => {
        const res = await axios.get(`${API_URL}/admin/${endpoint}`);
        return res.data;
    },
    post: async (endpoint, data) => {
        const res = await axios.post(`${API_URL}/admin/${endpoint}`, data);
        return res.data;
    },
    delete: async (endpoint, id) => {
        const res = await axios.delete(`${API_URL}/admin/${endpoint}/${id}`);
        return res.data;
    }
}
