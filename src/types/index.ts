export type Role = 'admin' | 'ops';

export interface Department {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
}

export interface BasicInfo {
  id?: number;
  fullName: string;
  email: string;
  department: string;
  role: 'Ops' | 'Admin' | 'Engineer' | 'Finance';
  employeeId: string;
}

export interface Details {
  id?: number;
  employeeId: string;
  photo?: string; // Base64
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  officeLocation: string;
  notes?: string;
}

export interface Employee extends BasicInfo, Details {}

export type SubmitStep =
  | { step: 1; message: 'Submitting employee basic information...' }
  | { step: 2; message: 'Basic information saved successfully!' }
  | { step: 3; message: 'Submitting employee details...' }
  | { step: 4; message: 'Employee details saved successfully!' }
  | { step: 5; message: 'Employee registration completed successfully!' };
