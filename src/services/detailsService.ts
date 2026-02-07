import { fetchApi } from './api';
import type { Details } from '../types';
import { API_STEP2_URL } from '../config/env';

const BASE_URL = API_STEP2_URL;

export const detailsService = {
  getAll: async (): Promise<Details[]> => {
    return fetchApi<Details[]>(`${BASE_URL}/details`);
  },

  getPaginated: async (page: number, limit: number): Promise<Details[]> => {
    return fetchApi<Details[]>(
      `${BASE_URL}/details?_page=${page}&_limit=${limit}`
    );
  },

  create: async (data: Details): Promise<Details> => {
    return fetchApi<Details>(`${BASE_URL}/details`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getByEmployeeId: async (employeeId: string): Promise<Details[]> => {
    return fetchApi<Details[]>(
      `${BASE_URL}/details?employeeId=${encodeURIComponent(employeeId)}`
    );
  },

  update: async (id: number, data: Partial<Details>): Promise<Details> => {
    return fetchApi<Details>(`${BASE_URL}/details/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getLocations: async (search?: string): Promise<{ id: number; name: string }[]> => {
    const url = search
      ? `${BASE_URL}/locations?name_like=${encodeURIComponent(search)}`
      : `${BASE_URL}/locations`;
    return fetchApi<{ id: number; name: string }[]>(url);
  },
};
