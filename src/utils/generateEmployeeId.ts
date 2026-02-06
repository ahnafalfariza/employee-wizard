import type { BasicInfo } from '../types';

export const generateEmployeeId = async (department: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:4001/basicInfo');
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
