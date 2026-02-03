'use client';

import { Cpu, MemoryStick, HardDrive } from 'lucide-react';
import type { NinjaOneDevice, NinjaOneHardware } from '@/lib/ninjaone';

/**
 * Props for the HardwarePanel component.
 */
interface HardwarePanelProps {
  hardware: NinjaOneHardware;
}

/**
 * Formats bytes to human-readable size.
 */
function formatSize(gb?: number): string {
  if (!gb) return 'N/A';
  if (gb >= 1000) {
    return `${(gb / 1000).toFixed(1)} TB`;
  }
  return `${gb} GB`;
}

/**
 * Returns color class for disk usage percentage.
 */
function getDiskUsageColor(usedPercent: number): string {
  if (usedPercent >= 90) return 'bg-red-500';
  if (usedPercent >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

/**
 * Displays hardware information panel for a device.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function HardwarePanel({ hardware }: HardwarePanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Cpu className="h-5 w-5 text-blue-500" />
        Hardware
      </h2>

      <div className="space-y-4">
        {/* Manufacturer & Model */}
        {(hardware.manufacturer || hardware.model) && (
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Manufacturer / Model</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {hardware.manufacturer || 'Unknown'} {hardware.model || ''}
            </p>
          </div>
        )}

        {/* Serial Number */}
        {hardware.serialNumber && (
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Serial Number</p>
            <p className="font-mono text-sm text-gray-900 dark:text-white">
              {hardware.serialNumber}
            </p>
          </div>
        )}

        {/* Processor */}
        {hardware.processorName && (
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Processor</p>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">
              {hardware.processorName}
            </p>
            {hardware.processorCores && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hardware.processorCores} cores
              </p>
            )}
          </div>
        )}

        {/* RAM */}
        {hardware.ramGb && (
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <MemoryStick className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Memory (RAM)</p>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatSize(hardware.ramGb)}
            </p>
          </div>
        )}

        {/* Disk Drives */}
        {hardware.diskDrives && hardware.diskDrives.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Storage</p>
            </div>
            <div className="space-y-3">
              {hardware.diskDrives.map((disk, index) => {
                const usedGb = disk.sizeGb && disk.freeGb ? disk.sizeGb - disk.freeGb : 0;
                const usedPercent = disk.sizeGb ? Math.round((usedGb / disk.sizeGb) * 100) : 0;

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {disk.name || `Drive ${index + 1}`}
                        {disk.type && disk.type !== 'Unknown' && (
                          <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {disk.type}
                          </span>
                        )}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatSize(usedGb)} / {formatSize(disk.sizeGb)}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getDiskUsageColor(usedPercent)}`}
                        style={{ width: `${usedPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {usedPercent}% used • {formatSize(disk.freeGb)} free
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BIOS */}
        {hardware.biosVersion && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">BIOS Version</p>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {hardware.biosVersion}
              {hardware.biosDate && ` (${hardware.biosDate})`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HardwarePanel;
