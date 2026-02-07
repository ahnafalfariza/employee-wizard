import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { z } from 'zod';
import { Select } from '../../components/Select/Select';
import { Autocomplete } from '../../components/Autocomplete/Autocomplete';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { Input } from '../../components/Input/Input';
import { useFormState } from '../../hooks/useFormState';
import { useStepDraft, restoreStepDraft } from '../../hooks/useDraftPersistence';
import type { Details, Location, Role } from '../../types';
import { API_STEP2_URL } from '../../config/env';
import styles from './Creation.module.css';

const detailsSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  photo: z.string().optional(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern'], {
    message: 'Employment type is required',
  }),
  officeLocation: z.string().min(1, 'Office location is required'),
  notes: z.string().optional(),
});

type DetailsFormData = z.infer<typeof detailsSchema>;

interface StepDetailsProps {
  onSubmit: (data: Details & { employeeId: string }) => void;
  role: Role;
  employeeId?: string;
  showEmployeeIdInput?: boolean;
  initialDetails?: Details | null;
}

// Restore draft outside component to get initial values synchronously
const getInitialValues = (
  role: Role,
  propEmployeeId?: string,
  initialDetails?: Details | null
): DetailsFormData => {
  if (initialDetails !== undefined) {
    if (initialDetails) {
      return {
        employeeId: initialDetails.employeeId || propEmployeeId || '',
        photo: initialDetails.photo || '',
        employmentType: (initialDetails.employmentType || '') as DetailsFormData['employmentType'],
        officeLocation: initialDetails.officeLocation || '',
        notes: initialDetails.notes || '',
      };
    }
    // Fill-details mode, no existing record: empty form with employeeId
    return {
      employeeId: propEmployeeId || '',
      photo: '',
      employmentType: '' as DetailsFormData['employmentType'],
      officeLocation: '',
      notes: '',
    };
  }
  const draft = restoreStepDraft<DetailsFormData>(`${role}_step2`);
  return {
    employeeId: propEmployeeId || draft?.employeeId || '',
    photo: draft?.photo || '',
    employmentType: (draft?.employmentType || '') as DetailsFormData['employmentType'],
    officeLocation: draft?.officeLocation || '',
    notes: draft?.notes || '',
  };
};

export const StepDetails = ({
  onSubmit,
  role,
  employeeId: propEmployeeId,
  showEmployeeIdInput = false,
  initialDetails,
}: StepDetailsProps) => {
  // Get initial values from draft or initialDetails (only computed once)
  const [initialValues] = useState(() =>
    getInitialValues(role, propEmployeeId, initialDetails)
  );

  const {
    values,
    errors,
    setValue,
    handleChange,
    handleBlur,
    validate,
  } = useFormState<DetailsFormData>({
    initialValues,
    schema: detailsSchema,
    validateOnChange: true,
  });

  // Auto-save draft every 2 seconds
  useStepDraft(`${role}_step2`, values);

  // Sync external employeeId prop
  useEffect(() => {
    if (propEmployeeId) {
      setValue('employeeId', propEmployeeId);
    }
  }, [propEmployeeId, setValue]);

  const handleLocationSelect = (location: Location) => {
    setValue('officeLocation', location.name);
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...values,
        employeeId: values.employeeId,
      });
    }
  };

  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue('notes', e.target.value);
  };

  return (
    <form onSubmit={handleFormSubmit} className={styles.form}>
      <h2 className={styles.stepTitle}>Step 2: Details</h2>

      {showEmployeeIdInput && (
        <Input
          id="employeeId"
          label="Employee ID"
          value={values.employeeId}
          onChange={handleChange('employeeId')}
          onBlur={handleBlur('employeeId')}
          error={errors.employeeId}
          placeholder="e.g., ENG-001"
        />
      )}

      {!showEmployeeIdInput && propEmployeeId && (
        <div className={styles.readOnlyField}>
          <label className={styles.label}>Employee ID</label>
          <div className={styles.employeeIdDisplay}>{propEmployeeId}</div>
        </div>
      )}

      <FileUpload
        id="photo"
        label="Photo"
        value={values.photo}
        onChange={(base64) => setValue('photo', base64)}
        error={errors.photo}
      />

      <Select
        id="employmentType"
        label="Employment Type"
        options={[
          { value: 'Full-time', label: 'Full-time' },
          { value: 'Part-time', label: 'Part-time' },
          { value: 'Contract', label: 'Contract' },
          { value: 'Intern', label: 'Intern' },
        ]}
        value={values.employmentType}
        onChange={handleChange('employmentType')}
        onBlur={handleBlur('employmentType')}
        error={errors.employmentType}
      />

      <Autocomplete<Location>
        id="officeLocation"
        label="Office Location"
        endpoint={`${API_STEP2_URL}/locations`}
        queryParam="name_like"
        onSelect={handleLocationSelect}
        value={values.officeLocation}
        error={errors.officeLocation}
        placeholder="Search locations..."
      />

      <div className={styles.textareaWrapper}>
        <label htmlFor="notes" className={styles.label}>
          Notes
        </label>
        <textarea
          id="notes"
          value={values.notes}
          onChange={handleNotesChange}
          className={styles.textarea}
          rows={4}
          placeholder="Additional notes (optional)"
        />
      </div>
    </form>
  );
};
