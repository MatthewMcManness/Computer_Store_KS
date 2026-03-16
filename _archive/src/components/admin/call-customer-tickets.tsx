'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Clock, User, Ticket, RefreshCw, AlertCircle } from 'lucide-react';

interface CallCustomerTicket {
  id: number;
  number: string;
  subject: string;
  customer_name: string;
  customer_id: number;
  status_changed_at: string;
  customer_question: string | null;
  created_at: string;
}

export function CallCustomerTickets() {
  const router = useRouter();
  const [tickets, setTickets] = useState<CallCustomerTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/repairshopr/tickets/call-customer');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tickets');
      }

      setTickets(data.tickets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleTicketClick = (ticketId: number) => {
    // Navigate to ticket detail page
    router.push(`/admin/tickets/${ticketId}`);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50">
            <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Call Customer</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} need{tickets.length === 1 ? 's' : ''} customer contact
            </p>
          </div>
        </div>
        <button
          onClick={fetchTickets}
          disabled={isLoading}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && tickets.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="mt-3 text-gray-500 dark:text-gray-400">No tickets need customer calls</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => handleTicketClick(ticket.id)}
                className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Ticket Title */}
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span className="truncate font-medium text-gray-900 dark:text-white">
                        #{ticket.number}: {ticket.subject}
                      </span>
                    </div>

                    {/* Customer Name */}
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{ticket.customer_name}</span>
                    </div>
                  </div>

                  {/* Time Since Status Changed */}
                  <div className="flex flex-shrink-0 items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeAgo(ticket.status_changed_at)}</span>
                  </div>
                </div>

                {/* Customer Question if present */}
                {ticket.customer_question && (
                  <div className="mt-2 rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <span className="font-medium">Question: </span>
                    {ticket.customer_question}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
