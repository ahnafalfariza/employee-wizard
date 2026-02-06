import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { StepBasicInfo } from './StepBasicInfo';
import { StepDetails } from './StepDetails';
import { clearAllDrafts } from '../../hooks/useDraftPersistence';
import { basicInfoService } from '../../services/basicInfoService';
import { detailsService } from '../../services/detailsService';
import type { Role, BasicInfo, Details, SubmitStep } from '../../types';
import styles from './Creation.module.css';

export const CreationLayout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const role: Role = (searchParams.get('role') as Role) || 'admin';
  const employeeIdFromUrl = searchParams.get('employeeId') ?? undefined;
  const isFillDetailsMode = role === 'ops' && !!employeeIdFromUrl;

  const [currentStep, setCurrentStep] = useState<'step1' | 'step2'>(
    role === 'admin' ? 'step1' : 'step2'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<SubmitStep | null>(null);

  const [basicInfoData, setBasicInfoData] = useState<BasicInfo | null>(null);
  const [existingDetails, setExistingDetails] = useState<Details | null | undefined>(
    isFillDetailsMode ? undefined : null
  );

  useEffect(() => {
    if (!isFillDetailsMode || !employeeIdFromUrl) return;
    let cancelled = false;
    detailsService
      .getByEmployeeId(employeeIdFromUrl)
      .then((list) => {
        if (!cancelled) setExistingDetails(list[0] ?? null);
      })
      .catch(() => {
        if (!cancelled) setExistingDetails(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isFillDetailsMode, employeeIdFromUrl]);

  const handleStep1Submit = (data: BasicInfo) => {
    setBasicInfoData(data);
    setCurrentStep('step2');
  };

  const handleStep2Submit = async (data: Details & { employeeId: string }) => {
    if (!basicInfoData && role === 'admin') {
      alert('Please complete Step 1 first');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isFillDetailsMode) {
        // Fill details mode: only submit details (update or create)
        setSubmitProgress({ step: 3, message: 'Submitting employee details...' });
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (existingDetails?.id != null) {
          await detailsService.update(existingDetails.id, data);
        } else {
          await detailsService.create(data);
        }
        setSubmitProgress({ step: 4, message: 'Employee details saved successfully!' });
        setSubmitProgress({ step: 5, message: 'Employee registration completed successfully!' });
      } else {
        setSubmitProgress({ step: 1, message: 'Submitting employee basic information...' });
        const basicInfoToSubmit = basicInfoData || {
          fullName: 'Ops User',
          email: 'ops@example.com',
          department: 'Operations',
          role: 'Ops' as const,
          employeeId: data.employeeId,
        };

        if (role === 'admin' || !basicInfoData) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await basicInfoService.create(basicInfoToSubmit);
          setSubmitProgress({ step: 2, message: 'Basic information saved successfully!' });
        } else {
          setSubmitProgress({ step: 2, message: 'Basic information saved successfully!' });
        }

        setSubmitProgress({ step: 3, message: 'Submitting employee details...' });
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await detailsService.create(data);
        setSubmitProgress({ step: 4, message: 'Employee details saved successfully!' });
        setSubmitProgress({ step: 5, message: 'Employee registration completed successfully!' });
      }

      clearAllDrafts(role);
      setTimeout(() => {
        navigate('/employees');
      }, 1500);
    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      setSubmitProgress(null);
      alert('Failed to submit employee data. Please check your connection and try again.');
    }
  };

  const handleClearDraft = useCallback(() => {
    if (confirm('Are you sure you want to clear the draft?')) {
      clearAllDrafts(role);
      setBasicInfoData(null);
      if (role === 'admin') {
        setCurrentStep('step1');
      }
      window.location.reload();
    }
  }, [role]);

  return (
    <div className={styles.creationContainer}>
      <div className={styles.creationHeader}>
        <h1 className={styles.creationTitle}>Add Employee</h1>
        <div className={styles.roleBadge}>
          Role: <strong>{role.toUpperCase()}</strong>
        </div>
      </div>

      {isSubmitting && submitProgress && (
        <div className={styles.progressContainer}>
          <ProgressBar currentStep={submitProgress} />
        </div>
      )}

      {!isSubmitting && (
        <>
          {currentStep === 'step1' && role === 'admin' && (
            <StepBasicInfo
              onSubmit={handleStep1Submit}
              role={role}
            />
          )}

          {currentStep === 'step2' &&
            (isFillDetailsMode && existingDetails === undefined ? (
              <div className={styles.loading}>Loading details...</div>
            ) : (
              <StepDetails
                onSubmit={handleStep2Submit}
                role={role}
                employeeId={basicInfoData?.employeeId ?? employeeIdFromUrl}
                showEmployeeIdInput={role === 'ops' && !basicInfoData && !employeeIdFromUrl}
                initialDetails={isFillDetailsMode ? existingDetails ?? null : undefined}
              />
            ))}

          <div className={styles.creationActions}>
            {currentStep === 'step1' && role === 'admin' && (
              <Button
                type="button"
                onClick={() => {
                  const form = document.querySelector('form');
                  form?.requestSubmit();
                }}
                disabled={false}
              >
                Next
              </Button>
            )}

            {currentStep === 'step2' && (
              <>
                {role === 'admin' && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setCurrentStep('step1')}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => {
                    const form = document.querySelector('form');
                    form?.requestSubmit();
                  }}
                  isLoading={isSubmitting}
                >
                  Submit
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={handleClearDraft}
            >
              Clear Draft
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
