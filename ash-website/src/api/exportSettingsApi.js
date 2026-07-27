import apiClient from './apiClient';

export async function previewExport(params) {
  const { data } = await apiClient.get('/export/preview', { params });
  return data.data;
}

export function downloadExportUrl(format, params) {
  const query = new URLSearchParams(params).toString();
  return `${apiClient.defaults.baseURL}/export/${format}?${query}`;
}

export async function downloadExportFile(format, params, filename) {
  const response = await apiClient.get(`/export/${format}`, {
    params,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getSettings() {
  const { data } = await apiClient.get('/settings');
  return data.data;
}

export async function updateSettings(payload) {
  const { data } = await apiClient.patch('/settings', payload);
  return data.data;
}
