/**
 * BUTTON - The submit control for the contact form, and nothing else.
 *
 * This used to ship six class-variance-authority variants and four
 * sizes. Five of the variants pointed at admin-era tokens that are not
 * part of the redesign system (bg-secondary, bg-background,
 * bg-destructive), and every one of them had zero consumers: the public
 * site's links use CTALink and PhoneLink, so the only real button on
 * the site is the form's submit. The variants were deleted for the same
 * reason Badge, Card, Input, Textarea, Select and Skeleton were, and
 * with the last variant gone the cva wrapper went with them. Per-form
 * adjustments ride on `className`.
 *
 * WHEN TO EDIT: When the form's submit button changes. If a second kind
 * of button ever appears, build it here as a real second component
 * rather than reintroducing a variant matrix for one caller.
 */
'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

/**
 * No focus overrides: the `.site :focus-visible` rule (2px brand
 * outline, 3px offset) is the one focus signature for every public
 * control.
 */
const BUTTON_CLASS =
  'inline-flex min-h-[44px] items-center justify-center rounded-md bg-brand px-8 py-2 text-base ' +
  'font-medium text-page transition-colors duration-normal ease-brand hover:bg-brand-deep ' +
  'active:bg-brand-deep disabled:pointer-events-none disabled:opacity-50';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Swaps the leading icon for a spinner and disables the control */
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(BUTTON_CLASS, className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
