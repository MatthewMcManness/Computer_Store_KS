'use client';

import { Network, Wifi, Globe, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { NinjaOneNetworkAdapter } from '@/lib/ninjaone';

/**
 * Props for the NetworkPanel component.
 */
interface NetworkPanelProps {
  adapters?: NinjaOneNetworkAdapter[];
}

/**
 * Returns icon for adapter type.
 */
function getAdapterIcon(type?: string) {
  switch (type) {
    case 'WiFi':
      return <Wifi className="h-4 w-4" />;
    case 'Ethernet':
      return <Network className="h-4 w-4" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
}

/**
 * Copy button component with feedback.
 */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

/**
 * Displays network adapter information panel for a device.
 *
 * @param props - Component properties
 * @returns JSX element
 *
 * @version 1.0.0 - 2026-02-03T00:00:00Z - Initial implementation
 */
export function NetworkPanel({ adapters }: NetworkPanelProps) {
  if (!adapters || adapters.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Network className="h-5 w-5 text-green-500" />
          Network
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No network adapter information available
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Network className="h-5 w-5 text-green-500" />
        Network
      </h2>

      <div className="space-y-4">
        {adapters.map((adapter, index) => (
          <div
            key={index}
            className={`${index > 0 ? 'pt-4 border-t border-gray-100 dark:border-gray-800' : ''}`}
          >
            {/* Adapter header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400">{getAdapterIcon(adapter.type)}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {adapter.name}
              </span>
              {adapter.type && adapter.type !== 'Unknown' && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {adapter.type}
                </span>
              )}
            </div>

            {/* MAC Address */}
            {adapter.macAddress && (
              <div className="flex items-center text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400 w-20">MAC:</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  {adapter.macAddress}
                </span>
                <CopyButton text={adapter.macAddress} />
              </div>
            )}

            {/* IP Addresses */}
            {adapter.ipAddresses && adapter.ipAddresses.length > 0 && (
              <div className="space-y-1">
                {adapter.ipAddresses.map((ip, ipIndex) => {
                  const isIPv6 = ip.includes(':');
                  return (
                    <div key={ipIndex} className="flex items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400 w-20">
                        {isIPv6 ? 'IPv6:' : 'IPv4:'}
                      </span>
                      <span className="font-mono text-gray-700 dark:text-gray-300 truncate">
                        {ip}
                      </span>
                      <CopyButton text={ip} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NetworkPanel;
