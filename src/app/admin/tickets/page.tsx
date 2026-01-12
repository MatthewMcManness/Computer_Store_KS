'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Ticket,
  User,
  Clock,
  Loader2,
  Filter,
  ChevronDown,
} from 'lucide-react';

interface StatusDefinition {
  status: string;
  display_name: string;
  description: string | null;
  repairshopr_status: string;
  show_customer_question: boolean;
  customer_visible_status: string | null;
  sort_order: number;
  is_active: boolean;
}

interface StatusOverride {
  id: string;
  repairshopr_ticket_id: number;
  custom_status: string;
  customer_question: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface TicketData {
  id: number;
  number: string;
  subject: string;
  customer_id: number;
  customer_business_then_name?: string;
  status?: string;
  problem_type?: string;
  created_at?: string;
  updated_at?: string;
}

export default function TicketsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [statusDefinitions, setStatusDefinitions] = useState<StatusDefinition[]>([]);
  const [ticketStatusOverrides, setTicketStatusOverrides] = useState<Record<number, StatusOverride>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load status definitions on mount
  useEffect(() => {
    const loadStatusDefinitions = async () => {
      try {
        const response = await fetch('/api/repairshopr/tickets/status-definitions');
        const data = await response.json();
        if (data.definitions) {
          setStatusDefinitions(data.definitions);
        }
      } catch (err) {
        console.error('Failed to load status definitions:', err);
      }
    };
    loadStatusDefinitions();
  }, []);

  // Load initial tickets based on status filter
  useEffect(() => {
    if (initialStatus) {
      fetchTickets(initialStatus, '');
    }
  }, []);

  const fetchTickets = useCallback(async (status: string, query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('q', query.trim());
      if (status) params.append('status', status);

      const response = await fetch(`/api/repairshopr/tickets?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tickets');
      }

      const fetchedTickets = data.tickets || [];
      setTickets(fetchedTickets);

      // Fetch status overrides for all tickets
      if (fetchedTickets.length > 0) {
        const ticketIds = fetchedTickets.map((t: TicketData) => t.id);
        try {
          const overridesRes = await fetch('/api/repairshopr/tickets/status-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_ids: ticketIds }),
          });
          const overridesData = await overridesRes.json();
          if (overridesRes.ok && overridesData.overrides) {
            setTicketStatusOverrides(overridesData.overrides);
          }
        } catch (overrideErr) {
          console.error('Failed to fetch status overrides:', overrideErr);
        }
      } else {
        setTicketStatusOverrides({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
      setTickets([]);
      setTicketStatusOverrides({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setShowMobileFilters(false);
    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    router.replace(`/admin/tickets?${params.toString()}`);
    fetchTickets(status, searchQuery);
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim().length >= 2 || statusFilter) {
      fetchTickets(statusFilter, searchQuery);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchTickets(statusFilter, searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, fetchTickets]);

  // Get display status for a ticket (custom override or RepairShopr status)
  const getDisplayStatus = (ticket: TicketData) => {
    const override = ticketStatusOverrides[ticket.id];
    if (override) {
      const definition = statusDefinitions.find(d => d.status === override.custom_status);
      return definition?.display_name || override.custom_status;
    }
    return ticket.status || 'Unknown';
  };

  // Get status color class
  const getStatusColorClass = (status: string, customStatus?: string) => {
    const statusKey = customStatus || status?.toLowerCase();
    switch (statusKey) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'diagnosing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'repairing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'data_transferring':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300';
      case 'installing':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300';
      case 'waiting_for_parts':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'building':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300';
      case 'call_customer':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'waiting_for_customer_reply':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'ready_for_pickup':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'completed':
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage repair tickets</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, customer name, or subject..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
          >
            <Filter className="h-4 w-4" />
            Filter by Status
            <ChevronDown className={`h-4 w-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Desktop Status Filter Buttons */}
          <div className="hidden flex-wrap gap-2 lg:flex">
            <button
              onClick={() => handleStatusChange('')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                !statusFilter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {statusDefinitions.filter(s => s.is_active && s.status !== 'completed').map((def) => (
              <button
                key={def.status}
                onClick={() => handleStatusChange(def.status)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  statusFilter === def.status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {def.display_name}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filter Dropdown */}
        {showMobileFilters && (
          <div className="mt-4 grid grid-cols-2 gap-2 lg:hidden">
            <button
              onClick={() => handleStatusChange('')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                !statusFilter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              All
            </button>
            {statusDefinitions.filter(s => s.is_active && s.status !== 'completed').map((def) => (
              <button
                key={def.status}
                onClick={() => handleStatusChange(def.status)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  statusFilter === def.status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {def.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tickets List */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="text-red-600 dark:text-red-400">{error}</div>
            <button
              onClick={() => fetchTickets(statusFilter, searchQuery)}
              className="mt-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Try again
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Ticket className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter
                ? 'No tickets match your search criteria'
                : 'Select a status filter or search for tickets'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tickets.map((ticket) => {
              const override = ticketStatusOverrides[ticket.id];
              const displayStatus = getDisplayStatus(ticket);
              const statusColor = getStatusColorClass(ticket.status || '', override?.custom_status);

              return (
                <button
                  key={ticket.id}
                  onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Ticket className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          #{ticket.number}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                          {displayStatus}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-gray-900 dark:text-white">
                        {ticket.subject}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {ticket.customer_business_then_name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(ticket.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
