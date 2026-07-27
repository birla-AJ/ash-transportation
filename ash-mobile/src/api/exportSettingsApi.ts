import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import apiClient, { tokenStorage, BASE_URL } from './apiClient';
import { AppSettings, ChallanQuery, ExportPreview } from '../types';

export async function previewExport(params: ChallanQuery): Promise<ExportPreview> {
  const { data } = await apiClient.get('/export/preview', { params });
  return data.data;
}

function buildQueryString(params: Record<string, unknown> = {}): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null);
  return new URLSearchParams(entries as [string, string][]).toString();
}

const MIME_TYPES: Record<string, string> = {
  csv: 'text/csv',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

// Downloads the export file into app storage then opens the native share sheet,
// which lets the user save it to Files/Drive, email it, etc. — the mobile
// equivalent of the browser's automatic blob download in ash-website.
export async function downloadAndShareExport(
  format: 'csv' | 'excel' | 'pdf',
  params: ChallanQuery,
  filename: string,
): Promise<string> {
  const token = await tokenStorage.getAccessToken();
  const query = buildQueryString(params as Record<string, unknown>);
  const url = `${BASE_URL}/export/${format}${query ? `?${query}` : ''}`;
  const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;

  const { promise } = RNFS.downloadFile({
    fromUrl: url,
    toFile: destPath,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  await promise;

  await Share.open({
    url: `file://${destPath}`,
    type: MIME_TYPES[format] || 'application/octet-stream',
    filename,
    failOnCancel: false,
  });

  return destPath;
}

export async function getSettings(): Promise<AppSettings> {
  const { data } = await apiClient.get('/settings');
  return data.data;
}

export async function updateSettings(payload: Partial<AppSettings>): Promise<AppSettings> {
  const { data } = await apiClient.patch('/settings', payload);
  return data.data;
}
