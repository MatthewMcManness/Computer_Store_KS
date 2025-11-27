import type { Metadata } from 'next';
import { BUSINESS_INFO } from '@/lib/constants';
import { SilverPlanClient } from './silver-plan-client';

export const metadata: Metadata = {
  title: 'Silver Plan - Monthly Maintenance Program',
  description: `${BUSINESS_INFO.name} Silver Plan: $24.99/month preventive maintenance program. Includes anti-virus software, 50% off virus removal, free diagnostics, help desk support, and more. 3-month minimum commitment.`,
  openGraph: {
    title: `Silver Plan | ${BUSINESS_INFO.name}`,
    description: `$24.99/month preventive maintenance program. Anti-virus protection, discounted services, free diagnostics, and help desk support.`,
  },
};

export default function SilverPlanPage() {
  return <SilverPlanClient />;
}
