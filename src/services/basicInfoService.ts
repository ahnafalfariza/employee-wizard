import { fetchApi } from './api';
import type { BasicInfo } from '../types';
import { API_STEP1_URL } from '../config/env';

const BASE_URL = API_STEP1_URL;

export const basicInfoService = {
  getAll: async (): Promise<BasicInfo[]> => {
    return fetchApi<BasicInfo[]>(`${BASE_URL}/basicInfo`);
  },

  getPaginated: async (page: number, limit: number): Promise<BasicInfo[]> => {
    return fetchApi<BasicInfo[]>(
      `${BASE_URL}/basicInfo?_page=${page}&_limit=${limit}`
    );
  },

  create: async (data: BasicInfo): Promise<BasicInfo> => {
    return fetchApi<BasicInfo>(`${BASE_URL}/basicInfo`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getDepartments: async (search?: string): Promise<{ id: number; name: string }[]> => {
    const url = search
      ? `${BASE_URL}/departments?name_like=${encodeURIComponent(search)}`
      : `${BASE_URL}/departments`;
    return fetchApi<{ id: number; name: string }[]>(url);
  },
};
