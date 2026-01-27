'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Ticket,
  X,
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
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import type { RepairShoprCustomer } from '@/lib/repairshopr';
import { isSilverPlanCustomer } from '@/lib/repairshopr';

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

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [customer, setCustomer] = useState<RepairShoprCustomer | null>(null);
  const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
  const [statusOverride, setStatusOverride] = useState<StatusOverride | null>(null);
  const [statusDefinitions, setStatusDefinitions] = useState<StatusDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Load ticket details
  const loadTicketDetails = useCallback(async () => {
    if (!ticketId) return;

    setIsLoading(true);
    setError(null);

    try {
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

      setTicket(ticketData.ticket);
      setPublicNotes(notesData.notes || []);
      setStatusOverride(statusData.status_override || null);

      if (statusData.status_override) {
        setCustomStatus(statusData.status_override.custom_status);
        setCustomerQuestion(statusData.status_override.customer_question || '');
      } else {
        setCustomStatus('new');
        setCustomerQuestion('');
      }

      // Fetch customer details
      if (ticketData.ticket?.customer_id) {
        try {
          const customerRes = await fetch(`/api/repairshopr/customers/${ticketData.ticket.customer_id}`);
          if (customerRes.ok) {
            const customerData = await customerRes.json();
            setCustomer(customerData.customer);

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
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicketDetails();
  }, [loadTicketDetails]);

  const openEditModal = () => {
    if (ticket) {
      setEditFormData({
        subject: ticket.subject || '',
        status: ticket.status || '',
        problem_type: ticket.problem_type || '',
        priority: ticket.priority || '',
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!ticket) return;

    setIsSavingEdit(true);
    try {
      const response = await fetch(`/api/repairshopr/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update ticket');
      }

      setTicket(data.ticket);
      setShowEditModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSendPrivateNote = async () => {
    if (!ticket || !privateNote.trim()) return;

    setIsSendingNote(true);
    try {
      const response = await fetch(`/api/repairshopr/tickets/${ticket.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: privateNote.trim(),
          hidden: true,
          do_not_email: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add note');
      }

      await loadTicketDetails();
      setPrivateNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add private note');
    } finally {
      setIsSendingNote(false);
    }
  };

  const handleSendPublicNote = async () => {
    if (!ticket || !publicNote.trim()) return;

    setIsSendingNote(true);
    try {
      const response = await fetch(`/api/repairshopr/tickets/${ticket.id}/public-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: publicNote.trim(),
          customer_id: ticket.customer_id,
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
    if (!ticket || !confirm('Delete this public note?')) return;

    try {
      const response = await fetch(
        `/api/repairshopr/tickets/${ticket.id}/public-notes?note_id=${noteId}`,
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
    if (!ticket) return;

    setIsSavingStatus(true);
    try {
      const response = await fetch(`/api/repairshopr/tickets/${ticket.id}/status`, {
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
      if (data.ticket) {
        setTicket(data.ticket);
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'diagnosing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'repairing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'data_transferring':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300';
      case 'installing':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300';
      case 'waiting_for_parts':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'building':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300';
      case 'call_customer':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'waiting_for_customer_reply':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'ready_for_pickup_no_payment_due':
      case 'ready_for_pickup_payment_due':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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

  const getMergedNotes = (): UnifiedNote[] => {
    const notes: UnifiedNote[] = [];
    const publicNoteContents = new Set(publicNotes.map((n) => n.content.trim()));

    if (ticket?.comments) {
      for (const comment of ticket.comments) {
        const isOurOutgoingMessage =
          comment.subject === 'Update from The Computer Store' ||
          publicNoteContents.has(comment.body?.trim() || '');

        if (isOurOutgoingMessage && !comment.hidden) {
          continue;
        }

        let noteType: 'private' | 'customer' | 'staff';

        if (comment.hidden) {
          noteType = 'private';
        } else if (!comment.tech) {
          noteType = 'customer';
        } else {
          noteType = 'staff';
        }

        notes.push({
          id: `rs-${comment.id}`,
          type: noteType,
          body: comment.body,
          author: comment.tech || ticket.customer_business_then_name || 'Customer',
          subject: comment.subject,
          created_at: comment.created_at,
          canDelete: false,
        });
      }
    }

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

    return notes.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  };

  const getNoteStyle = (type: UnifiedNote['type']) => {
    switch (type) {
      case 'private':
        return {
          border: 'border-amber-400 dark:border-amber-600',
          bg: 'bg-amber-50 dark:bg-amber-900/30',
          icon: EyeOff,
          iconColor: 'text-amber-600 dark:text-amber-400',
          label: 'Private Note',
        };
      case 'customer':
        return {
          border: 'border-purple-400 dark:border-purple-600',
          bg: 'bg-purple-50 dark:bg-purple-900/30',
          icon: User,
          iconColor: 'text-purple-600 dark:text-purple-400',
          label: 'Customer',
        };
      case 'staff':
        return {
          border: 'border-blue-400 dark:border-blue-600',
          bg: 'bg-blue-50 dark:bg-blue-900/30',
          icon: Eye,
          iconColor: 'text-blue-600 dark:text-blue-400',
          label: 'Staff Comment',
        };
      case 'public':
        return {
          border: 'border-green-400 dark:border-green-600',
          bg: 'bg-green-50 dark:bg-green-900/30',
          icon: Eye,
          iconColor: 'text-green-600 dark:text-green-400',
          label: 'Public Note',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error || 'Ticket not found'}</div>
        <Link href="/admin/tickets" className="text-blue-600 hover:underline dark:text-blue-400">
          Back to tickets
        </Link>
      </div>
    );
  }

  const mergedNotes = getMergedNotes();
  const currentStatusDef = getStatusDefinition(customStatus);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ticket #{ticket.number}
            </h1>
            {statusOverride && (
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${getCustomStatusColor(statusOverride.custom_status)}`}>
                {currentStatusDef?.display_name || statusOverride.custom_status}
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">{ticket.subject}</p>
        </div>
        <button
          onClick={openEditModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Info Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 ${customer && isSilverPlanCustomer(customer) ? 'silver-plan-card' : ''}`}>
            {!customer ? (
              <div className="flex flex-col items-center justify-center py-8">
                <User className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-center text-gray-500 dark:text-gray-400">
                  Loading customer info...
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-bold text-gray-900 dark:text-white">
                          {customer.fullname || `${customer.firstname} ${customer.lastname}`}
                        </h3>
                        {isSilverPlanCustomer(customer) && (
                          <span className="silver-plan-badge inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                            <Sparkles className="h-3 w-3" />
                            Silver Plan
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {customer.id}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Contact Information
                  </h4>

                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}

                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                  )}

                  {customer.mobile && customer.mobile !== customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{customer.mobile} (mobile)</span>
                    </div>
                  )}

                  {customer.business_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{customer.business_name}</span>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span>
                        {customer.address}
                        {customer.address_2 && `, ${customer.address_2}`}
                        {customer.city && `, ${customer.city}`}
                        {customer.state && `, ${customer.state}`}
                        {customer.zip && ` ${customer.zip}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Portal Access</span>
                    {loadingPortalAccount ? (
                      <Loader2 className="ml-auto h-4 w-4 animate-spin text-gray-400" />
                    ) : portalAccount ? (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
                        <Check className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                        <X className="h-3 w-3" />
                        No Password
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ticket Status Control */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Ticket className="h-5 w-5" />
              Ticket Status
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {statusDefinitions.map((def) => (
                    <option key={def.status} value={def.status}>
                      {def.display_name}
                    </option>
                  ))}
                </select>
              </div>

              {isQuestionRequired(customStatus) && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer Question
                  </label>
                  <textarea
                    value={customerQuestion}
                    onChange={(e) => setCustomerQuestion(e.target.value)}
                    placeholder="What question do you need answered?"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}

              <button
                onClick={handleSaveCustomStatus}
                disabled={isSavingStatus}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSavingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Update Status
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(ticket.created_at)}</span>
                </div>
                {ticket.updated_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Updated: {formatDate(ticket.updated_at)}</span>
                  </div>
                )}
                {ticket.problem_type && (
                  <div>Type: {ticket.problem_type}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Timeline */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="border-b border-gray-200 p-6 dark:border-gray-700">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <MessageSquare className="h-5 w-5" />
                Notes & Communication
              </h3>
            </div>

            {/* Notes List */}
            <div className="max-h-[500px] overflow-y-auto p-6">
              {mergedNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No notes yet. Add a note below.
                </div>
              ) : (
                <div className="space-y-4">
                  {mergedNotes.map((note) => {
                    const style = getNoteStyle(note.type);
                    const Icon = style.icon;

                    return (
                      <div
                        key={note.id}
                        className={`rounded-lg border-l-4 p-4 ${style.border} ${style.bg}`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${style.iconColor}`} />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {style.label}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {note.author}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {formatDate(note.created_at)}
                            </span>
                            {note.canDelete && (
                              <button
                                onClick={() => handleDeletePublicNote(note.id.replace('pub-', ''))}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                          {note.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Note Input */}
            <div className="border-t border-gray-200 p-6 dark:border-gray-700">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Private Note (internal only)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={privateNote}
                      onChange={(e) => setPrivateNote(e.target.value)}
                      placeholder="Add a private note..."
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    <button
                      onClick={handleSendPrivateNote}
                      disabled={isSendingNote || !privateNote.trim()}
                      className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      {isSendingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Public Note (sent to customer via SMS/email)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={publicNote}
                      onChange={(e) => setPublicNote(e.target.value)}
                      placeholder="Add a public note..."
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    <button
                      onClick={handleSendPublicNote}
                      disabled={isSendingNote || !publicNote.trim()}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {isSendingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Ticket</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subject
                </label>
                <input
                  type="text"
                  value={editFormData.subject}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Problem Type
                </label>
                <input
                  type="text"
                  value={editFormData.problem_type}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, problem_type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <select
                  value={editFormData.priority}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, priority: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isSavingEdit}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSavingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
