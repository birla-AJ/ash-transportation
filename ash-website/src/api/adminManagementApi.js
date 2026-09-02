import apiClient from './apiClient';

// ---- Super Admin: manages Sub Admins ----

export async function fetchSubAdmins() {
  const { data } = await apiClient.get('/super-admin/sub-admins');
  return data.data;
}

export async function createSubAdmin({ name, email, password }) {
  const { data } = await apiClient.post('/super-admin/sub-admins', { name, email, password });
  return data.data;
}

export async function deleteSubAdmin(id) {
  const { data } = await apiClient.delete(`/super-admin/sub-admins/${id}`);
  return data.data;
}

// ---- Sub Admin: manages Admins + dashboard ----

export async function fetchSubAdminDashboard() {
  const { data } = await apiClient.get('/sub-admin/dashboard');
  return data.data;
}

export async function fetchAdmins() {
  const { data } = await apiClient.get('/sub-admin/admins');
  return data.data;
}

export async function createAdmin({ name, email, password, signatureImage }) {
  const { data } = await apiClient.post('/sub-admin/admins', { name, email, password, signatureImage });
  return data.data;
}

export async function setAdminStatus(id, isActive) {
  const { data } = await apiClient.patch(`/sub-admin/admins/${id}/status`, { isActive });
  return data.data;
}

export async function setAdminSignature(id, signatureImage) {
  const { data } = await apiClient.patch(`/sub-admin/admins/${id}/signature`, { signatureImage });
  return data.data;
}

export async function deleteAdmin(id) {
  const { data } = await apiClient.delete(`/sub-admin/admins/${id}`);
  return data.data;
}
