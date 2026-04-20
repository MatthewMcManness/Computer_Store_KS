/**
 * MODAL DIALOG - Popup overlay used for confirmations and forms in the admin panel.
 *
 * WHEN TO EDIT: When changing the modal design or animation.
 */
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      children,
      title,
      description,
      className,
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
    },
    ref
  ) => {
    const modalRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose, closeOnEscape]);

    React.useEffect(() => {
      if (isOpen && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        firstElement?.focus();
      }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Modal Content */}
        <div
          ref={ref || modalRef}
          className={cn(
            'relative z-50 w-full max-w-lg rounded-lg bg-background p-6 shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {title && (
            <h2
              id="modal-title"
              className="text-lg font-semibold leading-none tracking-tight"
            >
              {title}
            </h2>
          )}

          {description && (
            <p
              id="modal-description"
              className="mt-2 text-sm text-muted-foreground"
            >
              {description}
            </p>
          )}

          <div className={cn(title || description ? 'mt-4' : '')}>
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export { Modal };
