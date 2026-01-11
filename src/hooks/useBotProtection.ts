import { useRef } from 'react';

/**
 * Custom hook for implementing basic bot protection in forms.
 *
 * Provides timing analysis and honeypot fields to detect automated submissions.
 * This is a lightweight protection mechanism that should be combined with server-side
 * validation and rate limiting for complete bot prevention.
 *
 * The hook tracks page load time to detect suspiciously fast submissions and
 * provides hidden honeypot fields that bots often fill but humans should not see.
 *
 * @returns Object containing:
 *   - timing: String timestamp of when the page/component loaded (Unix milliseconds)
 *   - honeypotFields: Object with three hidden field values that should remain empty
 *
 * @sideEffects
 * - Captures page load timestamp on mount (stored in ref, persists across renders)
 *
 * @example
 * ```tsx
 * const ContactForm = () => {
 *   const { timing, honeypotFields } = useBotProtection();
 *
 *   const handleSubmit = (e) => {
 *     const formData = {
 *       ...regularFields,
 *       _timing: timing,
 *       ...honeypotFields
 *     };
 *     // Server validates timing and ensures honeypot fields are empty
 *     submitForm(formData);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {/* Hidden honeypot fields - do not display to users */}
 *       <input type="text" name="_hp_email2" value={honeypotFields._hp_email2}
 *              style={{ display: 'none' }} onChange={() => {}} />
 *       <input type="text" name="_hp_phone_confirm" value={honeypotFields._hp_phone_confirm}
 *              style={{ display: 'none' }} onChange={() => {}} />
 *       <input type="text" name="_hp_url" value={honeypotFields._hp_url}
 *              style={{ display: 'none' }} onChange={() => {}} />
 *       {/* Regular form fields */}
 *     </form>
 *   );
 * };
 * ```
 *
 * @functions_called useRef (React)
 * @called_by ContactForm, any public-facing forms requiring bot protection
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function useBotProtection() {
  const pageLoadTime = useRef<number>(Date.now());

  return {
    timing: pageLoadTime.current.toString(),
    honeypotFields: {
      _hp_email2: '',
      _hp_phone_confirm: '',
      _hp_url: '',
    },
  };
}
