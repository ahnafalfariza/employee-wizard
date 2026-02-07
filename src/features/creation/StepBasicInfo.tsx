import { useEffect, useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { Autocomplete } from '../../components/Autocomplete/Autocomplete';
import { generateEmployeeId } from '../../utils/generateEmployeeId';
import { useFormState } from '../../hooks/useFormState';
import { useStepDraft, restoreStepDraft } from '../../hooks/useDraftPersistence';
import type { BasicInfo, Department, Role } from '../../types';
import { API_STEP1_URL } from '../../config/env';
import styles from './Creation.module.css';

const basicInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  role: z.enum(['Ops', 'Admin', 'Engineer', 'Finance'], {
    message: 'Role is required',
  }),
  employeeId: z.string(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface StepBasicInfoProps {
  onSubmit: (data: BasicInfo) => void;
  role: Role;
}

// Restore draft outside component to get initial values synchronously
const getInitialValues = (role: Role): BasicInfoFormData => {
  const draft = restoreStepDraft<BasicInfoFormData>(`${role}_step1`);
  return {
    fullName: draft?.fullName || '',
    email: draft?.email || '',
    department: draft?.department || '',
    role: (draft?.role || '') as BasicInfoFormData['role'],
    employeeId: draft?.employeeId || '',
  };
};

export const StepBasicInfo = ({ onSubmit, role }: StepBasicInfoProps) => {
  // Get initial values from draft (only computed once)
  const [initialValues] = useState(() => getInitialValues(role));

  const {
    values,
    errors,
    setValue,
    handleChange,
    handleBlur,
    validate,
  } = useFormState<BasicInfoFormData>({
    initialValues,
    schema: basicInfoSchema,
    validateOnChange: true,
  });

  // Auto-save draft every 2 seconds
  useStepDraft(`${role}_step1`, values);

  // Generate employee ID when department changes
  useEffect(() => {
    if (values.department) {
      generateEmployeeId(values.department)
        .then((id) => {
          setValue('employeeId', id);
        })
        .catch((error) => {
          console.error('Error generating employee ID:', error);
        });
    }
  }, [values.department]);

  const handleDepartmentSelect = (dept: Department) => {
    setValue('department', dept.name);
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(values as BasicInfo);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className={styles.form}>
      <h2 className={styles.stepTitle}>Step 1: Basic Information</h2>
      
      <Input
        id="fullName"
        label="Full Name"
        value={values.fullName}
        onChange={handleChange('fullName')}
        onBlur={handleBlur('fullName')}
        error={errors.fullName}
      />

      <Input
        id="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        error={errors.email}
      />

      <Autocomplete<Department>
        id="department"
        label="Department"
        endpoint={`${API_STEP1_URL}/departments`}
        queryParam="name_like"
        onSelect={handleDepartmentSelect}
        value={values.department}
        error={errors.department}
        placeholder="Search departments..."
      />

      <Select
        id="role"
        label="Role"
        options={[
          { value: 'Ops', label: 'Ops' },
          { value: 'Admin', label: 'Admin' },
          { value: 'Engineer', label: 'Engineer' },
          { value: 'Finance', label: 'Finance' },
        ]}
        value={values.role}
        onChange={handleChange('role')}
        onBlur={handleBlur('role')}
        error={errors.role}
      />

      <div className={styles.readOnlyField}>
        <label className={styles.label}>Employee ID</label>
        <div className={styles.employeeIdDisplay}>
          {values.employeeId || 'Will be generated...'}
        </div>
      </div>
    </form>
  );
};
