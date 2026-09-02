import apiClient from './apiClient';

/** Active transporters only — for the Admin's Add Challan dropdown. */
export async function fetchActiveTransporters() {
  const { data } = await apiClient.get('/transporters');
  return data.data;
}

/** All transporters (active + inactive) — for the Sub Admin's management table. */
export async function fetchAllTransporters() {
  const { data } = await apiClient.get('/transporters', { params: { all: 'true' } });
  return data.data;
}

export async function createTransporter({ name, address }) {
  const { data } = await apiClient.post('/transporters', { name, address });
  return data.data;
}

export async function setTransporterStatus(id, isActive) {
  const { data } = await apiClient.patch(`/transporters/${id}/status`, { isActive });
  return data.data;
}
