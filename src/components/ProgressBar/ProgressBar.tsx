import { useEffect, useState } from 'react';
import styles from './ProgressBar.module.css';
import type { SubmitStep } from '../../types';

interface ProgressBarProps {
  currentStep: SubmitStep | null;
}

export const ProgressBar = ({ currentStep }: ProgressBarProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  if (!currentStep) return null;

  const currentStepNumber = currentStep.step;
  const progress = (currentStepNumber / 5) * 100;

  useEffect(() => {
    // Smooth animation for progress bar
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 50);
    return () => clearTimeout(timer);
  }, [progress]);

  const isComplete = currentStepNumber === 5;

  return (
    <div className={styles.progressContainer} role="status" aria-live="polite">
      <div className={styles.progressHeader}>
        <div className={styles.progressTitleWrapper}>
          <h3 className={styles.progressTitle}>{currentStep.message}</h3>
          <span className={styles.stepIndicator}>
            Step {currentStepNumber} of 5
          </span>
        </div>
        <span className={styles.progressPercentage} aria-hidden="true">
          {Math.round(animatedProgress)}%
        </span>
      </div>

      <div className={styles.progressBarWrapper}>
        <div
          className={styles.progressBar}
          role="progressbar"
          aria-valuenow={currentStepNumber}
          aria-valuemin={1}
          aria-valuemax={5}
          aria-label={`Step ${currentStepNumber} of 5: ${currentStep.message}`}
        >
          <div
            className={`${styles.progressFill} ${isComplete ? styles.complete : ''}`}
            style={{ width: `${animatedProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
