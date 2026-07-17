import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getEmployees = () => api.get('/employees');
export const getEmployeeById = (id) => api.get(`/employees/${id}`);
export const investigateEmployee = (emp_id) => api.post('/investigate', { emp_id });
export const freezeEmployee = (id, frozen_by) => api.post(`/freeze/${id}`, { frozen_by });
export const getAuditLogs = () => api.get('/audit');

export default api;
