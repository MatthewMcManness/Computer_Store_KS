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
} from 'lucide-react';

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
  const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
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

  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>('');

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

    try {
      // Fetch ticket details and public notes in parallel
      const [ticketRes, notesRes] = await Promise.all([
        fetch(`/api/repairshopr/tickets/${ticketId}`),
        fetch(`/api/repairshopr/tickets/${ticketId}/public-notes`),
      ]);

      const ticketData = await ticketRes.json();
      const notesData = await notesRes.json();

      if (!ticketRes.ok) {
        throw new Error(ticketData.error || 'Failed to load ticket');
      }

      setSelectedTicket(ticketData.ticket);
      setPublicNotes(notesData.notes || []);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4">
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

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Customer Reply">Customer Reply</option>
                  <option value="Waiting on Customer">Waiting on Customer</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Results */}
              <div className="mt-6">
                {isLoading ? (
                  <div className="py-8 text-center text-gray-500">Searching...</div>
                ) : tickets.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    {searchQuery.length >= 2 || statusFilter
                      ? 'No tickets found'
                      : 'Enter at least 2 characters or select a status'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => handleSelectTicket(ticket)}
                        className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                          selectedTicket?.id === ticket.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
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
                          </div>
                          <p className="mt-1 truncate text-sm text-gray-600">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ticket.customer_business_then_name}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                            selectedTicket.status
                          )}`}
                        >
                          {selectedTicket.status || 'Unknown'}
                        </span>
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

                {/* Notes & Comments */}
                <div className="rounded-lg border border-gray-200 bg-white">
                  <div className="border-b px-6 py-4">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <MessageSquare className="h-5 w-5" />
                      Notes & Communications
                    </h3>
                  </div>

                  <div className="max-h-96 overflow-y-auto p-6">
                    {/* Private Notes (from RepairShopr) */}
                    {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                      <div className="space-y-4">
                        {selectedTicket.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className={`rounded-lg p-4 ${
                              comment.hidden
                                ? 'border-l-4 border-amber-400 bg-amber-50'
                                : 'border-l-4 border-blue-400 bg-blue-50'
                            }`}
                          >
                            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                              {comment.hidden ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                              <span className="font-medium">
                                {comment.hidden ? 'Private Note' : 'Comment'}
                              </span>
                              {comment.tech && (
                                <>
                                  <span>by</span>
                                  <span className="font-medium">{comment.tech}</span>
                                </>
                              )}
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(comment.created_at)}</span>
                            </div>
                            {comment.subject && (
                              <p className="mb-1 font-medium text-gray-900">
                                {comment.subject}
                              </p>
                            )}
                            <p className="whitespace-pre-wrap text-sm text-gray-700">
                              {comment.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500">No comments yet</p>
                    )}

                    {/* Public Notes (from Supabase) */}
                    {publicNotes.length > 0 && (
                      <div className="mt-6">
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Eye className="h-4 w-4 text-green-600" />
                          Public Notes (visible to customer)
                        </h4>
                        <div className="space-y-3">
                          {publicNotes.map((note) => (
                            <div
                              key={note.id}
                              className="rounded-lg border-l-4 border-green-400 bg-green-50 p-4"
                            >
                              <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{note.author_name}</span>
                                  <span>•</span>
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDate(note.created_at)}</span>
                                </div>
                                <button
                                  onClick={() => handleDeletePublicNote(note.id)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete note"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="whitespace-pre-wrap text-sm text-gray-700">
                                {note.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

                      {/* Public Note */}
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Eye className="h-4 w-4 text-green-600" />
                          Add Public Note (visible to customer in portal)
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            value={publicNote}
                            onChange={(e) => setPublicNote(e.target.value)}
                            placeholder="Add a note visible to the customer..."
                            rows={2}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleSendPublicNote}
                            disabled={!publicNote.trim() || isSendingNote}
                            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
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
