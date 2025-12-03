import { useRef } from 'react';

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
