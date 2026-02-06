import { useRef, useState, type ChangeEvent } from 'react';
import { fileToBase64 } from '../../utils/fileToBase64';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  label?: string;
  value?: string; // Base64 string
  onChange: (base64: string) => void;
  error?: string;
  id?: string;
  accept?: string;
}

export const FileUpload = ({
  label,
  value,
  onChange,
  error,
  id = 'file-upload',
  accept = 'image/*',
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
    } catch (error) {
      console.error('Error converting file to base64:', error);
      alert('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.fileUpload}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.uploadArea}>
        {value ? (
          <div className={styles.previewContainer}>
            <img src={value} alt="Preview" className={styles.preview} />
            <button
              type="button"
              onClick={handleRemove}
              className={styles.removeButton}
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ) : (
          <div className={styles.uploadPlaceholder}>
            <input
              ref={fileInputRef}
              id={id}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className={styles.fileInput}
              disabled={isProcessing}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            <label htmlFor={id} className={styles.uploadLabel}>
              {isProcessing ? (
                'Processing...'
              ) : (
                <>
                  <span className={styles.uploadIcon}>📷</span>
                  <span>Click to upload or drag and drop</span>
                </>
              )}
            </label>
          </div>
        )}
      </div>
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
