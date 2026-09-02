import apiClient from './apiClient';

export async function createChallan({ truckNumber, placeOfDelivery, transporterId }) {
  const { data } = await apiClient.post('/challans', { truckNumber, placeOfDelivery, transporterId });
  return data.data;
}

export async function listChallans(params) {
  const { data } = await apiClient.get('/challans', { params });
  return data.data;
}

export async function getChallan(id) {
  const { data } = await apiClient.get(`/challans/${id}`);
  return data.data;
}

export async function updateChallan(id, payload) {
  const { data } = await apiClient.patch(`/challans/${id}`, payload);
  return data.data;
}

export async function deleteChallan(id, reason) {
  const { data } = await apiClient.delete(`/challans/${id}`, { data: { reason } });
  return data.data;
}

export async function registerPrint(id) {
  const { data } = await apiClient.post(`/challans/${id}/print`);
  return data.data;
}

export async function getDashboardStats() {
  const { data } = await apiClient.get('/dashboard');
  return data.data;
}
