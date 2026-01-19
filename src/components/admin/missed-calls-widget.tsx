'use client';

import { useState, useEffect } from 'react';
import { PhoneMissed, Clock, RefreshCw, AlertCircle, Phone, Play } from 'lucide-react';

interface MissedCall {
  id: string;
  callerNumber: string;
  callerNumberFormatted: string;
  callerName?: string;
  startTime: string;
  duration: number;
  durationFormatted: string;
  disposition: string;
  dispositionLabel: string;
  hasRecording: boolean;
  recordingUrl?: string;
}

interface ClickToCallProps {
  phoneNumber: string;
  callerName?: string;
}

interface MissedCallsWidgetProps {
  onClickToCall?: (props: ClickToCallProps) => void;
}

/**
 * Widget displaying recent missed calls from Cytracom phone system.
 *
 * Features:
 * - Shows missed and voicemail calls from last 24 hours
 * - Auto-refreshes every 60 seconds
 * - Includes callback button for each missed call
 * - Shows voicemail indicator with playback if available
 *
 * @param onClickToCall - Callback when user wants to return a call
 *
 * @functions_called fetch
 * @called_by ReceptionDashboard
 *
 * @version 1.0.0 - 2026-01-19T23:00:00Z - Initial implementation
 */
export function MissedCallsWidget({ onClickToCall }: MissedCallsWidgetProps) {
  const [calls, setCalls] = useState<MissedCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const fetchMissedCalls = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch missed calls from last 24 hours
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const response = await fetch(
        `/api/cytracom/call-history?missedOnly=true&startDate=${startDate}&limit=20`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch missed calls');
      }

      setCalls(data.calls || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load missed calls');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMissedCalls();
    // Refresh every 60 seconds
    const interval = setInterval(fetchMissedCalls, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCallback = (call: MissedCall) => {
    if (onClickToCall) {
      onClickToCall({
        phoneNumber: call.callerNumber,
        callerName: call.callerName,
      });
    }
  };

  const handlePlayVoicemail = (callId: string, audioUrl: string) => {
    if (playingAudio === callId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(callId);
      // Play audio - in real implementation would use an audio player
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => setPlayingAudio(null);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/50">
            <PhoneMissed className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Missed Calls</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {calls.length} missed call{calls.length !== 1 ? 's' : ''} in last 24h
            </p>
          </div>
        </div>
        <button
          onClick={fetchMissedCalls}
          disabled={isLoading}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && calls.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="mt-3 text-gray-500 dark:text-gray-400">No missed calls</p>
          </div>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="min-w-0 flex-1">
                  {/* Phone Number */}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {call.callerNumberFormatted}
                    </span>
                    {call.disposition === 'voicemail' && (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-400">
                        Voicemail
                      </span>
                    )}
                  </div>

                  {/* Caller Name if available */}
                  {call.callerName && (
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                      {call.callerName}
                    </p>
                  )}

                  {/* Time */}
                  <div className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(call.startTime)}</span>
                    {call.duration > 0 && (
                      <>
                        <span className="mx-1">·</span>
                        <span>{call.durationFormatted}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Play Voicemail Button */}
                  {call.hasRecording && call.recordingUrl && (
                    <button
                      onClick={() => handlePlayVoicemail(call.id, call.recordingUrl!)}
                      className={`rounded-lg p-2 transition-colors ${
                        playingAudio === call.id
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title="Play voicemail"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                  )}

                  {/* Callback Button */}
                  <button
                    onClick={() => handleCallback(call)}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                    title="Call back"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
