import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  cloneElement,
  isValidElement,
} from 'react';
import styles from './Popover.module.css';

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Popover = ({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, setOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, setOpen]);

  const handleTriggerClick = () => setOpen(!open);

  const triggerElement = isValidElement(trigger)
    ? cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, {
        onClick: (e: React.MouseEvent) => {
          (trigger as React.ReactElement<{ onClick?: () => void }>).props.onClick?.(e);
          handleTriggerClick();
        },
      })
    : (
        <button type="button" onClick={handleTriggerClick} className={styles.triggerButton}>
          {trigger}
        </button>
      );

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {triggerElement}
      {open && (
        <div
          className={styles.panel}
          role="dialog"
          aria-label="Notes"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
};
