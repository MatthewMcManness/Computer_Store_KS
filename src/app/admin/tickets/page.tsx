'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import {
  Search,
  Ticket,
  ChevronRight,
  X,
  MessageSquare,
  Eye,
  EyeOff,
  Send,
  Trash2,
  Edit3,
  Clock,
  User,
  Calendar,
  Mail,
  Phone,
  Building,
  MapPin,
  Key,
  Check,
  Loader2,
} from 'lucide-react';
import type { RepairShoprCustomer } from '@/lib/repairshopr';

interface TicketComment {
  id: number;
  created_at: string;
  body: string;
  tech?: string;
  hidden: boolean;
  subject?: string;
}

interface PublicNote {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

// Unified note type for chronological display
interface UnifiedNote {
  id: string;
  type: 'private' | 'customer' | 'staff' | 'public';
  body: string;
  author: string;
  subject?: string;
  created_at: string;
  canDelete?: boolean;
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
  due_date?: string;
  priority?: string;
  comments?: TicketComment[];
}

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<RepairShoprCustomer | null>(null);
  const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
  const [statusOverride, setStatusOverride] = useState<StatusOverride | null>(null);
  const [statusDefinitions, setStatusDefinitions] = useState<StatusDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    subject: '',
    status: '',
    problem_type: '',
    priority: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Note input state
  const [privateNote, setPrivateNote] = useState('');
  const [publicNote, setPublicNote] = useState('');
  const [isSendingNote, setIsSendingNote] = useState(false);

  // Custom status state
  const [customStatus, setCustomStatus] = useState('');
  const [customerQuestion, setCustomerQuestion] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Portal account state
  const [portalAccount, setPortalAccount] = useState<{ id: string; created_at: string } | null>(null);
  const [loadingPortalAccount, setLoadingPortalAccount] = useState(false);

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

  const searchTickets = useCallback(async () => {
    if (!searchQuery.trim() && !statusFilter) {
      setTickets([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/repairshopr/tickets?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search tickets');
      }

      setTickets(data.tickets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2 || statusFilter) {
        searchTickets();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, searchTickets]);

  const loadTicketDetails = async (ticketId: number) => {
    setIsLoadingDetails(true);
    setSelectedCustomer(null);
    setPortalAccount(null);

    try {
      // Fetch ticket details, public notes, and custom status in parallel
      const [ticketRes, notesRes, statusRes] = await Promise.all([
        fetch(`/api/repairshopr/tickets/${ticketId}`),
        fetch(`/api/repairshopr/tickets/${ticketId}/public-notes`),
        fetch(`/api/repairshopr/tickets/${ticketId}/status`),
      ]);

      const ticketData = await ticketRes.json();
      const notesData = await notesRes.json();
      const statusData = await statusRes.json();

      if (!ticketRes.ok) {
        throw new Error(ticketData.error || 'Failed to load ticket');
      }

      setSelectedTicket(ticketData.ticket);
      setPublicNotes(notesData.notes || []);
      setStatusOverride(statusData.status_override || null);

      // Set current custom status in form
      if (statusData.status_override) {
        setCustomStatus(statusData.status_override.custom_status);
        setCustomerQuestion(statusData.status_override.customer_question || '');
      } else {
        // Default to 'new' if no override exists
        setCustomStatus('new');
        setCustomerQuestion('');
      }

      // Fetch customer details and portal account status
      if (ticketData.ticket?.customer_id) {
        try {
          const customerRes = await fetch(`/api/repairshopr/customers/${ticketData.ticket.customer_id}`);
          if (customerRes.ok) {
            const customerData = await customerRes.json();
            setSelectedCustomer(customerData.customer);

            // Check portal account status
            setLoadingPortalAccount(true);
            try {
              const accountRes = await fetch(`/api/admin/customer-accounts?customer_id=${ticketData.ticket.customer_id}`);
              if (accountRes.ok) {
                const accountData = await accountRes.json();
                setPortalAccount(accountData.account);
              } else {
                setPortalAccount(null);
              }
            } catch {
              setPortalAccount(null);
            } finally {
              setLoadingPortalAccount(false);
            }
          }
        } catch (customerErr) {
          console.error('Failed to load customer:', customerErr);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSelectTicket = (ticket: TicketData) => {
    loadTicketDetails(ticket.id);
  };

  const openEditModal = () => {
    if (selectedTicket) {
      setEditFormData({
        subject: selectedTicket.subject || '',
        status: selectedTicket.status || '',
        problem_type: selectedTicket.problem_type || '',
        priority: selectedTicket.priority || '',
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedTicket) return;

    setIsSavingEdit(true);
    try {
      const response = await fetch(`/api/repairshopr/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update ticket');
      }

      setSelectedTicket(data.ticket);
      setShowEditModal(false);

      // Update in list
      setTickets((prev) =>
        prev.map((t) => (t.id === data.ticket.id ? { ...t, ...data.ticket } : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSendPrivateNote = async () => {
    if (!selectedTicket || !privateNote.trim()) return;

    setIsSendingNote(true);
    try {
      const response = await fetch(`/api/repairshopr/tickets/${selectedTicket.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: privateNote.trim(),
          hidden: true, // Private note
          do_not_email: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add note');
      }

      // Reload ticket to get updated comments
      await loadTicketDetails(selectedTicket.id);
      setPrivateNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add private note');
    } finally {
      setIsSendingNote(false);
    }
  };

  const handleSendPublicNote = async () => {
    if (!selectedTicket || !publicNote.trim()) return;

    setIsSendingNote(true);
    try {
      const response = await fetch(`/api/repairshopr/tickets/${selectedTicket.id}/public-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: publicNote.trim(),
          customer_id: selectedTicket.customer_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add public note');
      }

      setPublicNotes((prev) => [...prev, data.note]);
      setPublicNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add public note');
    } finally {
      setIsSendingNote(false);
    }
  };

  const handleDeletePublicNote = async (noteId: string) => {
    if (!selectedTicket || !confirm('Delete this public note?')) return;

    try {
      const response = await fetch(
        `/api/repairshopr/tickets/${selectedTicket.id}/public-notes?note_id=${noteId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete note');
      }

      setPublicNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const handleSaveCustomStatus = async () => {
    if (!selectedTicket) return;

    setIsSavingStatus(true);
    try {
      const response = await fetch(`/api/repairshopr/tickets/${selectedTicket.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_status: customStatus,
          customer_question: customerQuestion || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setStatusOverride(data.status_override);
      // Update the ticket's RepairShopr status if it was synced
      if (data.ticket) {
        setSelectedTicket(data.ticket);
        // Update in list
        setTickets((prev) =>
          prev.map((t) => (t.id === data.ticket.id ? { ...t, ...data.ticket } : t))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const getCustomStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'diagnosing':
        return 'bg-purple-100 text-purple-800';
      case 'repairing':
        return 'bg-yellow-100 text-yellow-800';
      case 'data_transferring':
        return 'bg-indigo-100 text-indigo-800';
      case 'installing':
        return 'bg-cyan-100 text-cyan-800';
      case 'waiting_for_parts':
        return 'bg-orange-100 text-orange-800';
      case 'building':
        return 'bg-pink-100 text-pink-800';
      case 'call_customer':
        return 'bg-red-100 text-red-800';
      case 'waiting_for_customer_reply':
        return 'bg-amber-100 text-amber-800';
      case 'ready_for_pickup':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDefinition = (status: string): StatusDefinition | undefined => {
    return statusDefinitions.find((d) => d.status === status);
  };

  const isQuestionRequired = (status: string): boolean => {
    const def = getStatusDefinition(status);
    return def?.show_customer_question || false;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Merge all notes into a single chronologically sorted array
  const getMergedNotes = (): UnifiedNote[] => {
    const notes: UnifiedNote[] = [];

    // Add RepairShopr comments
    if (selectedTicket?.comments) {
      for (const comment of selectedTicket.comments) {
        let noteType: 'private' | 'customer' | 'staff';

        if (comment.hidden) {
          noteType = 'private';
        } else if (!comment.tech) {
          // No tech means customer reply (email, SMS, portal)
          noteType = 'customer';
        } else {
          noteType = 'staff';
        }

        notes.push({
          id: `rs-${comment.id}`,
          type: noteType,
          body: comment.body,
          author: comment.tech || selectedTicket.customer_business_then_name || 'Customer',
          subject: comment.subject,
          created_at: comment.created_at,
          canDelete: false,
        });
      }
    }

    // Add Supabase public notes
    for (const note of publicNotes) {
      notes.push({
        id: `pub-${note.id}`,
        type: 'public',
        body: note.content,
        author: note.author_name,
        created_at: note.created_at,
        canDelete: true,
      });
    }

    // Sort chronologically (oldest first)
    return notes.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  };

  const getNoteStyle = (type: UnifiedNote['type']) => {
    switch (type) {
      case 'private':
        return {
          border: 'border-amber-400',
          bg: 'bg-amber-50',
          icon: EyeOff,
          iconColor: 'text-amber-600',
          label: 'Private Note',
        };
      case 'customer':
        return {
          border: 'border-purple-400',
          bg: 'bg-purple-50',
          icon: User,
          iconColor: 'text-purple-600',
          label: 'Customer',
        };
      case 'staff':
        return {
          border: 'border-blue-400',
          bg: 'bg-blue-50',
          icon: Eye,
          iconColor: 'text-blue-600',
          label: 'Staff Comment',
        };
      case 'public':
        return {
          border: 'border-green-400',
          bg: 'bg-green-50',
          icon: Eye,
          iconColor: 'text-green-600',
          label: 'Public Note',
        };
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'customer reply':
        return 'bg-purple-100 text-purple-800';
      case 'waiting on customer':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Search and manage service tickets</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search Panel - Full Width at Top */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search Tickets
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ticket #, subject, customer..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="w-48">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {statusDefinitions.map((def) => (
                  <option key={def.status} value={def.repairshopr_status}>
                    {def.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Results */}
          <div className="mt-4">
            {isLoading ? (
              <div className="py-4 text-center text-gray-500">Searching...</div>
            ) : tickets.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                {searchQuery.length >= 2 || statusFilter
                  ? 'No tickets found'
                  : 'Enter at least 2 characters or select a status'}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Ticket className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      #{ticket.number}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status || 'Unknown'}
                    </span>
                    <span className="max-w-[150px] truncate text-sm text-gray-600">
                      {ticket.subject}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Customer Info Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              {!selectedCustomer ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <User className="h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-center text-gray-500">
                    Select a ticket to view customer info
                  </p>
                </div>
              ) : (
                <div>
                  {/* Customer Header */}
                  <div className="mb-4 border-b border-gray-200 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-gray-900">
                          {selectedCustomer.fullname ||
                            `${selectedCustomer.firstname} ${selectedCustomer.lastname}`}
                        </h3>
                        <p className="text-sm text-gray-500">ID: {selectedCustomer.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mb-4 space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Contact Information
                    </h4>

                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{selectedCustomer.email}</span>
                      </div>
                    )}

                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    )}

                    {selectedCustomer.mobile && selectedCustomer.mobile !== selectedCustomer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedCustomer.mobile} (mobile)</span>
                      </div>
                    )}

                    {selectedCustomer.business_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{selectedCustomer.business_name}</span>
                      </div>
                    )}

                    {selectedCustomer.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span>
                          {selectedCustomer.address}
                          {selectedCustomer.address_2 && `, ${selectedCustomer.address_2}`}
                          {selectedCustomer.city && `, ${selectedCustomer.city}`}
                          {selectedCustomer.state && `, ${selectedCustomer.state}`}
                          {selectedCustomer.zip && ` ${selectedCustomer.zip}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Portal Access Status */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Portal Access</span>
                      {loadingPortalAccount ? (
                        <Loader2 className="ml-auto h-4 w-4 animate-spin text-gray-400" />
                      ) : portalAccount ? (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <Check className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          <X className="h-3 w-3" />
                          No Password
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details Panel */}
          <div className="lg:col-span-2">
            {isLoadingDetails ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-500">Loading ticket details...</p>
              </div>
            ) : selectedTicket ? (
              <div className="space-y-6">
                {/* Ticket Header */}
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">
                          Ticket #{selectedTicket.number}
                        </h2>
                        {/* Show custom status if available, otherwise show RepairShopr status */}
                        {statusOverride ? (
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${getCustomStatusColor(
                              statusOverride.custom_status
                            )}`}
                          >
                            {getStatusDefinition(statusOverride.custom_status)?.display_name ||
                              statusOverride.custom_status}
                          </span>
                        ) : (
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                              selectedTicket.status
                            )}`}
                          >
                            {selectedTicket.status || 'Unknown'}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-lg text-gray-700">{selectedTicket.subject}</p>
                      <p className="mt-2 text-sm text-gray-500">
                        <User className="mr-1 inline h-4 w-4" />
                        {selectedTicket.customer_business_then_name}
                      </p>
                    </div>
                    <button
                      onClick={openEditModal}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">Problem Type</p>
                      <p className="font-medium">{selectedTicket.problem_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Priority</p>
                      <p className="font-medium">{selectedTicket.priority || 'Normal'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="font-medium text-sm">
                        {formatDate(selectedTicket.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="font-medium text-sm">
                        {selectedTicket.due_date
                          ? new Date(selectedTicket.due_date).toLocaleDateString()
                          : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Workflow Status Panel */}
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">Workflow Status</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Current Status
                      </label>
                      <div className="flex items-center gap-3">
                        <select
                          value={customStatus}
                          onChange={(e) => setCustomStatus(e.target.value)}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {statusDefinitions.map((def) => (
                            <option key={def.status} value={def.status}>
                              {def.display_name}
                            </option>
                          ))}
                        </select>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${getCustomStatusColor(
                            customStatus
                          )}`}
                        >
                          {getStatusDefinition(customStatus)?.display_name || customStatus}
                        </span>
                      </div>
                    </div>

                    {/* Customer Question Field - shown for specific statuses */}
                    {isQuestionRequired(customStatus) && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Customer Question
                        </label>
                        <textarea
                          value={customerQuestion}
                          onChange={(e) => setCustomerQuestion(e.target.value)}
                          placeholder="What do you need to ask the customer?"
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveCustomStatus}
                        disabled={isSavingStatus}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSavingStatus ? 'Saving...' : 'Update Status'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes & Comments */}
                <div className="rounded-lg border border-gray-200 bg-white">
                  <div className="border-b px-6 py-4">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <MessageSquare className="h-5 w-5" />
                      Notes & Communications
                    </h3>
                  </div>

                  <div className="max-h-96 overflow-y-auto p-6">
                    {/* All notes in chronological order */}
                    {(() => {
                      const mergedNotes = getMergedNotes();
                      if (mergedNotes.length === 0) {
                        return <p className="text-center text-gray-500">No notes yet</p>;
                      }
                      return (
                        <div className="space-y-4">
                          {mergedNotes.map((note) => {
                            const style = getNoteStyle(note.type);
                            const IconComponent = style.icon;
                            return (
                              <div
                                key={note.id}
                                className={`rounded-lg border-l-4 ${style.border} ${style.bg} p-4`}
                              >
                                <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center gap-2">
                                    <IconComponent className={`h-3 w-3 ${style.iconColor}`} />
                                    <span className={`font-medium ${style.iconColor}`}>
                                      {style.label}
                                    </span>
                                    <span>by</span>
                                    <span className="font-medium">{note.author}</span>
                                    <span>•</span>
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDate(note.created_at)}</span>
                                  </div>
                                  {note.canDelete && (
                                    <button
                                      onClick={() => handleDeletePublicNote(note.id.replace('pub-', ''))}
                                      className="text-red-500 hover:text-red-700"
                                      title="Delete note"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                                {note.subject && (
                                  <p className="mb-1 font-medium text-gray-900">
                                    {note.subject}
                                  </p>
                                )}
                                <p className="whitespace-pre-wrap text-sm text-gray-700">
                                  {note.body}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Add Note Forms */}
                  <div className="border-t p-6">
                    <div className="space-y-4">
                      {/* Private Note */}
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <EyeOff className="h-4 w-4 text-amber-600" />
                          Add Private Note (internal only)
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            value={privateNote}
                            onChange={(e) => setPrivateNote(e.target.value)}
                            placeholder="Add a private note..."
                            rows={2}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleSendPrivateNote}
                            disabled={!privateNote.trim() || isSendingNote}
                            className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Public Note - sends SMS + Email + Portal */}
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Eye className="h-4 w-4 text-green-600" />
                          Send Message to Customer
                          <span className="ml-2 flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            <Phone className="h-3 w-3" />
                            <Mail className="h-3 w-3" />
                            SMS + Email + Portal
                          </span>
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            value={publicNote}
                            onChange={(e) => setPublicNote(e.target.value)}
                            placeholder="Type your message to the customer..."
                            rows={2}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleSendPublicNote}
                            disabled={!publicNote.trim() || isSendingNote}
                            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                            title="Send via SMS, Email, and save to Portal"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <Ticket className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">
                  Select a ticket to view details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h3 className="text-lg font-semibold">Edit Ticket</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={editFormData.subject}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, subject: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Customer Reply">Customer Reply</option>
                    <option value="Waiting on Customer">Waiting on Customer</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Problem Type
                  </label>
                  <input
                    type="text"
                    value={editFormData.problem_type}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, problem_type: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    value={editFormData.priority}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, priority: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
