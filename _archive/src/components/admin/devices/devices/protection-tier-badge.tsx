'use client';

import { Shield, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import type { DeviceProtectionTier } from '@/lib/devices';

/**
 * Props for the ProtectionTierBadge component.
 */
interface ProtectionTierBadgeProps {
  /** The protection tier to display */
  tier: DeviceProtectionTier;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Configuration for each protection tier.
 */
const tierConfig: Record<
  Exclude<DeviceProtectionTier, null>,
  {
    label: string;
    icon: typeof Shield;
    bgClass: string;
    textClass: string;
    borderClass: string;
    description: string;
  }
> = {
  eset: {
    label: 'ESET',
    icon: Shield,
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-400',
    borderClass: 'border-green-200 dark:border-green-800',
    description: 'ESET Protect antivirus monitoring',
  },
  silver: {
    label: 'Silver',
    icon: ShieldCheck,
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-700 dark:text-gray-300',
    borderClass: 'border-gray-200 dark:border-gray-700',
    description: 'NinjaOne RMM monitoring',
  },
  'silver-plus': {
    label: 'Silver+',
    icon: Sparkles,
    bgClass: 'bg-gradient-to-r from-gray-100 to-amber-100 dark:from-gray-800 dark:to-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-800',
    description: 'NinjaOne RMM + priority support',
  },
};

/**
 * Size configurations.
 */
const sizeConfig = {
  sm: {
    badge: 'px-1.5 py-0.5 text-xs',
    icon: 'h-3 w-3',
    gap: 'gap-1',
  },
  md: {
    badge: 'px-2 py-1 text-sm',
    icon: 'h-3.5 w-3.5',
    gap: 'gap-1.5',
  },
  lg: {
    badge: 'px-3 py-1.5 text-base',
    icon: 'h-4 w-4',
    gap: 'gap-2',
  },
};

/**
 * Displays a color-coded badge for device protection tiers.
 *
 * @param props - Component properties
 * @returns JSX element or null if tier is null
 *
 * @example
 * <ProtectionTierBadge tier="silver" />
 * <ProtectionTierBadge tier="silver-plus" showIcon size="lg" />
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function ProtectionTierBadge({
  tier,
  showIcon = true,
  className = '',
  size = 'sm',
}: ProtectionTierBadgeProps) {
  // Don't render anything for unmanaged devices
  if (!tier) {
    return null;
  }

  const config = tierConfig[tier];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center ${sizeStyles.gap} rounded-full font-medium
        ${sizeStyles.badge}
        ${config.bgClass}
        ${config.textClass}
        border ${config.borderClass}
        ${className}
      `}
      title={config.description}
    >
      {showIcon && <Icon className={sizeStyles.icon} />}
      {config.label}
    </span>
  );
}

/**
 * A variant that shows "Unmanaged" for null tiers instead of returning null.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function ProtectionTierBadgeWithUnmanaged({
  tier,
  showIcon = true,
  className = '',
  size = 'sm',
}: ProtectionTierBadgeProps) {
  const sizeStyles = sizeConfig[size];

  if (!tier) {
    return (
      <span
        className={`
          inline-flex items-center ${sizeStyles.gap} rounded-full font-medium
          ${sizeStyles.badge}
          bg-gray-50 dark:bg-gray-900
          text-gray-400 dark:text-gray-500
          border border-gray-200 dark:border-gray-800
          ${className}
        `}
        title="No protection plan - basic device record only"
      >
        {showIcon && <ShieldAlert className={sizeStyles.icon} />}
        Unmanaged
      </span>
    );
  }

  return (
    <ProtectionTierBadge
      tier={tier}
      showIcon={showIcon}
      className={className}
      size={size}
    />
  );
}

/**
 * Helper function to get tier display info for use in other components.
 *
 * @param tier - The protection tier
 * @returns Tier configuration or null
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function getTierDisplayInfo(tier: DeviceProtectionTier) {
  if (!tier) return null;
  return tierConfig[tier];
}

export default ProtectionTierBadge;
