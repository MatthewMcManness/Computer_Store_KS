/**
 * Device Components Index
 *
 * Exports all device-related components for the admin panel.
 * Components are organized by the unified devices system which supports
 * both managed (NinjaOne) and unmanaged devices.
 *
 * @module components/admin/devices
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */

// Unified device components (new system)
export { UnifiedDeviceCard } from './unified-device-card';
export { UnifiedDeviceList } from './unified-device-list';
export { DeviceForm, DeviceFormModal } from './device-form';
export { ProtectionTierBadge, ProtectionTierBadgeWithUnmanaged, getTierDisplayInfo } from './protection-tier-badge';
export { LinkNinjaOneDialog } from './link-ninjaone-dialog';

// Legacy NinjaOne-specific components (still used for hardware panels)
export { DeviceCard } from './device-card';
export { DeviceList } from './device-list';
export { DeviceHeader } from './device-header';
export { HardwarePanel } from './hardware-panel';
export { SystemPanel } from './system-panel';
export { NetworkPanel } from './network-panel';
export { DeviceActions } from './device-actions';
