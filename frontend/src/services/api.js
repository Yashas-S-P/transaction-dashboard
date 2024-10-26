import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = {
  async initializeDatabase() {
    const response = await axios.get(`${API_BASE_URL}/initialize-database`);
    return response.data;
  },

  async getTransactions(month, search = '', page = 1) {
    const response = await axios.get(`${API_BASE_URL}/transactions`, {
      params: { month, search, page }
    });
    return response.data;
  },

  async getStatistics(month) {
    const response = await axios.get(`${API_BASE_URL}/statistics`, {
      params: { month }
    });
    return response.data;
  },

  async getBarChartData(month) {
    const response = await axios.get(`${API_BASE_URL}/bar-chart`, {
      params: { month }
    });
    return response.data;
  },

  async getPieChartData(month) {
    const response = await axios.get(`${API_BASE_URL}/pie-chart`, {
      params: { month }
    });
    return response.data;
  },

  async getCombinedData(month) {
    const response = await axios.get(`${API_BASE_URL}/combined-data`, {
      params: { month }
    });
    return response.data;
  }
};

export default api;