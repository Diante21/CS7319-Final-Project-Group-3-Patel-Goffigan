import axios from 'axios';
import { AnalysisResult } from './types';

const getBaseUrl = (arch: 'layered' | 'eventbased'): string => {
  if (arch === 'layered') {
    return process.env.REACT_APP_LAYERED_URL || 'http://localhost:3001';
  }
  return process.env.REACT_APP_EVENTBASED_URL || 'http://localhost:3002';
};

export const analyzeText = async (
  text: string,
  arch: 'layered' | 'eventbased'
): Promise<AnalysisResult> => {
  const baseUrl = getBaseUrl(arch);
  const response = await axios.post<AnalysisResult>(`${baseUrl}/api/analyze`, { text });
  return response.data;
};

export const analyzeFile = async (
  file: File,
  arch: 'layered' | 'eventbased'
): Promise<AnalysisResult> => {
  const baseUrl = getBaseUrl(arch);
  const formData = new FormData();
  formData.append('resume', file);
  const response = await axios.post<AnalysisResult>(`${baseUrl}/api/analyze`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getHistory = async (
  arch: 'layered' | 'eventbased'
): Promise<AnalysisResult[]> => {
  const baseUrl = getBaseUrl(arch);
  const response = await axios.get<AnalysisResult[]>(`${baseUrl}/api/results`);
  return response.data;
};
