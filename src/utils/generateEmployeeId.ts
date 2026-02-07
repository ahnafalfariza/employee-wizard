import type { BasicInfo } from '../types';
import { API_STEP1_URL } from '../config/env';

export const generateEmployeeId = async (department: string): Promise<string> => {
  try {
    const response = await fetch(`${API_STEP1_URL}/basicInfo`);
    const employees: BasicInfo[] = await response.json();

    const deptPrefix = department.slice(0, 3).toUpperCase();
    const existingCount = employees.filter((emp) =>
      emp.employeeId?.startsWith(deptPrefix)
    ).length;

    return `${deptPrefix}-${String(existingCount + 1).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating employee ID:', error);
    // Fallback: use timestamp-based ID if API fails
    const deptPrefix = department.slice(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-3);
    return `${deptPrefix}-${timestamp}`;
  }
};
