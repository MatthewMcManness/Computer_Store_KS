'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Plus,
  Mail,
  Calendar,
  Shield,
  Wrench,
  UserCheck,
  Loader2,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import type { UserProfile, UserRole } from '@/lib/supabase-auth';

type EmployeeRole = 'admin' | 'technician' | 'receptionist';

const roleConfig: Record<EmployeeRole, { label: string; icon: React.ReactNode; className: string }> = {
  admin: {
    label: 'Admin',
    icon: <Shield className="h-4 w-4" />,
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  },
  technician: {
    label: 'Technician',
    icon: <Wrench className="h-4 w-4" />,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  },
  receptionist: {
    label: 'Receptionist',
    icon: <UserCheck className="h-4 w-4" />,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  },
};

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Edit role modal state
  const [editingEmployee, setEditingEmployee] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<EmployeeRole | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deletingEmployee, setDeletingEmployee] = useState<UserProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/employees');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Check authentication and get current user info
    fetch('/api/auth/check')
      .then(res => {
        if (!res.ok) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setCurrentUserEmail(data.user?.email || null);
          setIsAdmin(data.user?.role === 'admin');
        }
      })
      .catch(() => router.push('/admin/login'));

    fetchEmployees();
  }, [router, fetchEmployees]);

  const handleEditRole = (employee: UserProfile) => {
    setEditingEmployee(employee);
    setNewRole(employee.role as EmployeeRole);
    setRoleError(null);
  };

  const handleSaveRole = async () => {
    if (!editingEmployee || !newRole) return;

    setSavingRole(true);
    setRoleError(null);

    try {
      const response = await fetch(`/api/admin/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      // Update local state
      setEmployees(prev =>
        prev.map(e => (e.id === editingEmployee.id ? { ...e, role: newRole } : e))
      );
      setEditingEmployee(null);
      showToast('success', `${editingEmployee.full_name || editingEmployee.email}'s role updated to ${roleConfig[newRole].label}`);
    } catch (err) {
      setRoleError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteClick = (employee: UserProfile) => {
    setDeletingEmployee(employee);
    setConfirmDelete(false);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/admin/employees/${deletingEmployee.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete employee');
      }

      // Update local state
      setEmployees(prev => prev.filter(e => e.id !== deletingEmployee.id));
      setDeletingEmployee(null);
      showToast('success', `${deletingEmployee.full_name || deletingEmployee.email} has been removed`);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage employee accounts and roles
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/employees/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Employee Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">No employees found</p>
            {isAdmin && (
              <Link
                href="/admin/employees/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add your first employee
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Created
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {employees.map((employee) => {
                const role = employee.role as EmployeeRole;
                const config = roleConfig[role] || roleConfig.technician;
                const isSelf = employee.email === currentUserEmail;

                return (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {employee.full_name || 'No name'}
                            </p>
                            {isSelf && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
                      >
                        {config.icon}
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(employee.created_at)}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditRole(employee)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Edit role"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(employee)}
                            disabled={isSelf}
                            className={`rounded-lg p-2 ${
                              isSelf
                                ? 'cursor-not-allowed text-gray-300 dark:text-gray-600'
                                : 'text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                            }`}
                            title={isSelf ? "You can't delete yourself" : 'Delete employee'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Role Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Role
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Change role for {editingEmployee.full_name || editingEmployee.email}
              </p>
            </div>

            {roleError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {roleError}
              </div>
            )}

            <div className="space-y-3">
              {(Object.keys(roleConfig) as EmployeeRole[]).map((role) => {
                const config = roleConfig[role];
                const isSelected = newRole === role;

                return (
                  <button
                    key={role}
                    onClick={() => setNewRole(role)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${config.className}`}
                    >
                      {config.icon}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {config.label}
                    </span>
                    {isSelected && (
                      <Check className="ml-auto h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingEmployee(null)}
                disabled={savingRole}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                disabled={savingRole || newRole === editingEmployee.role}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingRole && <Loader2 className="h-4 w-4 animate-spin" />}
                {savingRole ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Delete Employee
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {deletingEmployee.full_name || deletingEmployee.email}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {deleteError}
              </div>
            )}

            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  I understand this will permanently delete this employee account
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingEmployee(null)}
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting || !confirmDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
