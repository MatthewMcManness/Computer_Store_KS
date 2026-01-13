'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Loader2, CheckCircle, XCircle, ChevronDown, ChevronRight, FileText, User, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ticket with deprecated status data from Supabase and RepairShopr.
 */
interface DeprecatedTicket {
  id: number;
  number: string;
  subject: string;
  status: string;
  customer_name: string;
  created_at: string;
  updated_at: string;
  // From Supabase override
  override_updated_by: string | null;
  override_updated_at: string;
  // Notes from RepairShopr
  notes: TicketNote[];
}

interface TicketNote {
  id: number;
  body: string;
  created_at: string;
  tech: string | null;
  subject: string | null;
  hidden: boolean;
}

interface StatusDefinition {
  status: string;
  display_name: string;
  description: string | null;
}

/**
 * Deprecated Statuses Admin Page
 *
 * Shows tickets that have been moved to deprecated RepairShopr statuses.
 * Only accessible by owner and lead_developer roles.
 *
 * Features:
 * - List all tickets with deprecated_rs_status
 * - Show which employee moved them to that status
 * - Display ticket notes for context
 * - Dropdown to reassign to correct Supabase status
 *
 * @functions_called fetch, useState, useEffect
 * @called_by App Router
 *
 * @version 1.0.0 - 2026-01-13T00:00:00Z - Initial implementation
 */
export default function DeprecatedStatusesPage() {
  const [tickets, setTickets] = useState<DeprecatedTicket[]>([]);
  const [statusDefinitions, setStatusDefinitions] = useState<StatusDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set());
  const [updatingTickets, setUpdatingTickets] = useState<Set<number>>(new Set());
  const [successTickets, setSuccessTickets] = useState<Set<number>>(new Set());

  /**
   * Fetch deprecated status tickets from API.
   */
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/deprecated-statuses');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch tickets');
      }
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch status definitions for the dropdown.
   */
  const fetchStatusDefinitions = useCallback(async () => {
    try {
      const response = await fetch('/api/repairshopr/tickets/status-definitions');
      if (response.ok) {
        const data = await response.json();
        // Filter out deprecated_rs_status from options
        setStatusDefinitions(
          (data.definitions || []).filter(
            (d: StatusDefinition) => d.status !== 'deprecated_rs_status'
          )
        );
      }
    } catch {
      console.error('Failed to fetch status definitions');
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchStatusDefinitions();
  }, [fetchTickets, fetchStatusDefinitions]);

  /**
   * Toggle ticket expansion to show/hide notes.
   */
  const toggleTicketExpansion = (ticketId: number) => {
    setExpandedTickets((prev) => {
      const next = new Set(prev);
      if (next.has(ticketId)) {
        next.delete(ticketId);
      } else {
        next.add(ticketId);
      }
      return next;
    });
  };

  /**
   * Update ticket status.
   */
  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    setUpdatingTickets((prev) => new Set(prev).add(ticketId));
    try {
      const response = await fetch(`/api/repairshopr/tickets/status/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_status: newStatus,
          customer_question: null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }

      // Mark as success and remove from list
      setSuccessTickets((prev) => new Set(prev).add(ticketId));
      setTimeout(() => {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
        setSuccessTickets((prev) => {
          const next = new Set(prev);
          next.delete(ticketId);
          return next;
        });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingTickets((prev) => {
        const next = new Set(prev);
        next.delete(ticketId);
        return next;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Deprecated RepairShopr Statuses
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tickets using old RepairShopr statuses that need correction
            </p>
          </div>
        </div>
        <button
          onClick={fetchTickets}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-pink-200 bg-pink-50 p-4 dark:border-pink-800 dark:bg-pink-900/20">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-pink-500" />
          <div className="text-sm text-pink-700 dark:text-pink-300">
            <p className="font-medium">These tickets are using deprecated RepairShopr statuses.</p>
            <p className="mt-1">
              Employees should not set tickets to these statuses directly in RepairShopr.
              Use the dropdown to assign the correct status, then follow up with the employee
              shown in the &quot;Set by&quot; column.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : tickets.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            All Clear!
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            No tickets are using deprecated RepairShopr statuses.
          </p>
        </div>
      ) : (
        /* Tickets List */
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} need attention
          </p>

          {tickets.map((ticket) => {
            const isExpanded = expandedTickets.has(ticket.id);
            const isUpdating = updatingTickets.has(ticket.id);
            const isSuccess = successTickets.has(ticket.id);

            return (
              <div
                key={ticket.id}
                className={cn(
                  'rounded-lg border bg-white transition-all dark:bg-gray-800',
                  isSuccess
                    ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                )}
              >
                {/* Ticket Header */}
                <div className="flex items-start gap-4 p-4">
                  {/* Expand Button */}
                  <button
                    onClick={() => toggleTicketExpansion(ticket.id)}
                    className="mt-1 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {/* Ticket Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            #{ticket.number}
                          </span>
                          <span className="rounded bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">
                            {ticket.status}
                          </span>
                        </div>
                        <h3 className="mt-1 truncate font-medium text-gray-900 dark:text-white">
                          {ticket.subject}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {ticket.customer_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(ticket.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Status Dropdown */}
                      <div className="flex-shrink-0">
                        {isSuccess ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">Updated!</span>
                          </div>
                        ) : (
                          <select
                            disabled={isUpdating}
                            onChange={(e) => {
                              if (e.target.value) {
                                updateTicketStatus(ticket.id, e.target.value);
                              }
                            }}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              {isUpdating ? 'Updating...' : 'Set Status'}
                            </option>
                            {statusDefinitions.map((def) => (
                              <option key={def.status} value={def.status}>
                                {def.display_name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Set By Info */}
                    <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm dark:bg-amber-900/20">
                      <span className="font-medium text-amber-700 dark:text-amber-400">
                        Set by:
                      </span>{' '}
                      <span className="text-amber-600 dark:text-amber-300">
                        {ticket.override_updated_by || 'System (auto-mapped)'}
                      </span>
                      <span className="text-amber-500 dark:text-amber-500">
                        {' '}on {formatDate(ticket.override_updated_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Notes Section */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FileText className="h-4 w-4" />
                      Ticket Notes ({ticket.notes.length})
                    </h4>
                    {ticket.notes.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No notes on this ticket.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {ticket.notes.map((note) => (
                          <div
                            key={note.id}
                            className={cn(
                              'rounded-lg border p-3',
                              note.hidden
                                ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                : 'border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20'
                            )}
                          >
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                {note.tech && (
                                  <>
                                    <User className="h-3 w-3" />
                                    <span className="font-medium">{note.tech}</span>
                                    <span>•</span>
                                  </>
                                )}
                                {formatDate(note.created_at)}
                              </span>
                              {note.hidden && (
                                <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                                  Private
                                </span>
                              )}
                            </div>
                            {note.subject && (
                              <div className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {note.subject}
                              </div>
                            )}
                            <div className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
                              {note.body}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
