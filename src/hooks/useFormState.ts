import { useState, useCallback, type ChangeEvent } from 'react';
import { z } from 'zod';

type FormErrors<T> = Partial<Record<keyof T, string>>;

interface UseFormStateOptions<T> {
  initialValues: T;
  schema?: z.ZodSchema<T>;
  validateOnChange?: boolean;
}

interface UseFormStateReturn<T> {
  values: T;
  errors: FormErrors<T>;
  isValid: boolean;
  touched: Partial<Record<keyof T, boolean>>;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  handleChange: (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  validate: () => boolean;
  reset: (newValues?: T) => void;
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onBlur: () => void;
  };
}

export function useFormState<T extends Record<string, unknown>>({
  initialValues,
  schema,
  validateOnChange = true,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (field: keyof T, value: unknown): string | undefined => {
      if (!schema) return undefined;

      try {
        // Validate the entire object to get field-specific errors
        schema.parse({ ...values, [field]: value });
        return undefined;
      } catch (err) {
        if (err instanceof z.ZodError) {
          const fieldError = err.issues.find((issue) => issue.path[0] === field);
          return fieldError?.message;
        }
        return undefined;
      }
    },
    [schema, values]
  );

  const validateAll = useCallback((): FormErrors<T> => {
    if (!schema) return {};

    try {
      schema.parse(values);
      return {};
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: FormErrors<T> = {};
        err.issues.forEach((issue) => {
          const field = issue.path[0] as keyof T;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        });
        return fieldErrors;
      }
      return {};
    }
  }, [schema, values]);

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
      }
    },
    [validateOnChange, validateField]
  );

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const handleChange = useCallback(
    (field: keyof T) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.value as T[keyof T];
        setValue(field, value);
      },
    [setValue]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validate on blur
      const error = validateField(field, values[field]);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    },
    [validateField, values]
  );

  const validate = useCallback((): boolean => {
    const allErrors = validateAll();
    setErrors(allErrors);

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    setTouched(allTouched);

    return Object.keys(allErrors).length === 0;
  }, [validateAll, values]);

  const reset = useCallback(
    (newValues?: T) => {
      setValuesState(newValues ?? initialValues);
      setErrors({});
      setTouched({});
    },
    [initialValues]
  );

  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: values[field],
      onChange: handleChange(field),
      onBlur: handleBlur(field),
    }),
    [values, handleChange, handleBlur]
  );

  const isValid = Object.keys(errors).length === 0 && Object.keys(touched).length > 0;

  return {
    values,
    errors,
    isValid,
    touched,
    setValue,
    setValues,
    handleChange,
    handleBlur,
    validate,
    reset,
    getFieldProps,
  };
}
