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
  Crown,
  Share2,
  Code2,
  Briefcase,
  Loader2,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
  X,
  MapPin,
} from 'lucide-react';
import type { UserProfile } from '@/lib/supabase-auth';
import {
  type BusinessRole,
  type AddOnRole,
  type EmployeeRole,
  BUSINESS_ROLES,
  ADD_ON_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  isBusinessRole,
  isAddOnRole,
} from '@/types/roles';
import {
  type LocationOption,
  canAccessAllLocations,
  GLOBAL_ACCESS_ROLES,
} from '@/types/locations';

/**
 * Role badge styling configuration.
 */
const roleStyles: Record<EmployeeRole, { icon: React.ReactNode; className: string }> = {
  // Business hierarchy roles
  receptionist: {
    icon: <UserCheck className="h-3 w-3" />,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  },
  technician: {
    icon: <Wrench className="h-3 w-3" />,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  },
  lead_technician: {
    icon: <Crown className="h-3 w-3" />,
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  },
  manager: {
    icon: <Briefcase className="h-3 w-3" />,
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  },
  owner: {
    icon: <Shield className="h-3 w-3" />,
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  },
  // Add-on roles
  social_media: {
    icon: <Share2 className="h-3 w-3" />,
    className: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
  },
  lead_developer: {
    icon: <Code2 className="h-3 w-3" />,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  },
};

/**
 * Extended UserProfile with roles array and default location.
 */
type ExtendedUserProfile = UserProfile;

/**
 * Extract roles array from a profile, with backward compatibility.
 */
function getRoles(profile: ExtendedUserProfile): string[] {
  if (profile.roles && Array.isArray(profile.roles) && profile.roles.length > 0) {
    return profile.roles;
  }
  // Backward compatibility: map old single role to new roles array
  if (profile.role) {
    if (profile.role === 'admin') {
      return ['owner', 'lead_developer'];
    }
    return [profile.role];
  }
  return ['receptionist'];
}

/**
 * Employees management page with multi-role support.
 *
 * Allows managers/owners to view and manage employee accounts,
 * including assigning multiple roles (business + add-on).
 *
 * @returns Employee management page component
 *
 * @functions_called getRoles, isBusinessRole, isAddOnRole
 * @called_by AdminLayout
 *
 * @version 2.0.0 - 2026-01-11T00:00:00Z - Updated for multi-role support
 */
export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<ExtendedUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [canManageEmployees, setCanManageEmployees] = useState(false);

  // Edit roles modal state
  const [editingEmployee, setEditingEmployee] = useState<ExtendedUserProfile | null>(null);
  const [selectedBusinessRole, setSelectedBusinessRole] = useState<BusinessRole>('receptionist');
  const [selectedAddOns, setSelectedAddOns] = useState<Set<AddOnRole>>(new Set());
  const [selectedDefaultLocation, setSelectedDefaultLocation] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPassword, setEditingPassword] = useState('');
  const [savingRoles, setSavingRoles] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Track if current user has lead_developer or owner role (for advanced editing)
  const [isLeadDeveloperOrOwner, setIsLeadDeveloperOrOwner] = useState(false);

  // Available locations for default location dropdown
  const [locations, setLocations] = useState<LocationOption[]>([]);

  // Delete confirmation modal state
  const [deletingEmployee, setDeletingEmployee] = useState<ExtendedUserProfile | null>(null);
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
          router.push('/login');
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
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setCurrentUserEmail(data.user?.email || null);
          // Check if user can manage employees (manager, owner, or lead_developer)
          const userRoles = data.roles || (data.user?.role ? [data.user.role] : []);
          const canManage = userRoles.some((r: string) =>
            ['admin', 'manager', 'owner', 'lead_developer'].includes(r)
          );
          setCanManageEmployees(canManage);

          // Check if user is lead_developer or owner (for advanced editing features)
          const hasAdvancedEditAccess = userRoles.some((r: string) =>
            ['lead_developer', 'owner'].includes(r)
          );
          setIsLeadDeveloperOrOwner(hasAdvancedEditAccess);

          // Get available locations from the location context
          if (data.locationContext?.availableLocations) {
            setLocations(data.locationContext.availableLocations);
          }
        }
      })
      .catch(() => router.push('/login'));

    fetchEmployees();
  }, [router, fetchEmployees]);

  const handleEditRoles = (employee: ExtendedUserProfile) => {
    const currentRoles = getRoles(employee);

    // Find business role
    const businessRole = currentRoles.find(r => isBusinessRole(r)) as BusinessRole || 'receptionist';
    setSelectedBusinessRole(businessRole);

    // Find add-on roles
    const addOns = currentRoles.filter(r => isAddOnRole(r)) as AddOnRole[];
    setSelectedAddOns(new Set(addOns));

    // Set current default location
    // Find the location slug from the location_id
    const defaultLocSlug = employee.default_location_id
      ? locations.find(l => l.slug === employee.default_location_id)?.slug || null
      : null;
    setSelectedDefaultLocation(defaultLocSlug);

    // Set current name and clear password
    setEditingName(employee.full_name || '');
    setEditingPassword('');

    setEditingEmployee(employee);
    setRoleError(null);
  };

  const handleToggleAddOn = (addOn: AddOnRole) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev);
      if (next.has(addOn)) {
        next.delete(addOn);
      } else {
        next.add(addOn);
      }
      return next;
    });
  };

  const handleSaveRoles = async () => {
    if (!editingEmployee) return;

    setSavingRoles(true);
    setRoleError(null);

    // Combine business role with add-ons
    const newRoles: string[] = [selectedBusinessRole, ...Array.from(selectedAddOns)];

    // Build the update payload
    const updatePayload: {
      roles: string[];
      default_location?: string | null;
      full_name?: string;
      password?: string;
    } = {
      roles: newRoles,
      default_location: selectedDefaultLocation,
    };

    // Include name and password only if current user has lead_developer or owner role
    if (isLeadDeveloperOrOwner) {
      if (editingName && editingName !== editingEmployee.full_name) {
        updatePayload.full_name = editingName;
      }
      if (editingPassword && editingPassword.length > 0) {
        // Validate password length client-side
        if (editingPassword.length < 12) {
          setRoleError('Password must be at least 12 characters long');
          setSavingRoles(false);
          return;
        }
        updatePayload.password = editingPassword;
      }
    }

    try {
      const response = await fetch(`/api/admin/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update employee');
      }

      // Update local state with actual server response
      const updatedEmployee = data.employee;
      setEmployees(prev =>
        prev.map(e => (e.id === editingEmployee.id ? {
          ...e,
          roles: updatedEmployee.roles || newRoles,
          role: updatedEmployee.role,
          default_location_id: updatedEmployee.default_location_id,
          full_name: updatedEmployee.full_name || e.full_name,
        } : e))
      );
      setEditingEmployee(null);
      showToast('success', `${editingName || editingEmployee.email}'s settings updated`);
    } catch (err) {
      setRoleError(err instanceof Error ? err.message : 'Failed to update employee');
    } finally {
      setSavingRoles(false);
    }
  };

  const handleDeleteClick = (employee: ExtendedUserProfile) => {
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
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage employee accounts and roles
          </p>
        </div>
        {canManageEmployees && (
          <Link
            href="/admin/employees/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 w-full sm:w-auto"
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
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">No employees found</p>
            {canManageEmployees && (
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
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Created
                </th>
                {canManageEmployees && (
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {employees.map((employee) => {
                const employeeRoles = getRoles(employee);
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
                      <div className="flex flex-wrap gap-1.5">
                        {employeeRoles.map((role) => {
                          const style = roleStyles[role as EmployeeRole] || roleStyles.receptionist;
                          return (
                            <span
                              key={role}
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}
                            >
                              {style.icon}
                              {ROLE_LABELS[role as EmployeeRole] || role}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(employee.created_at)}
                      </div>
                    </td>
                    {canManageEmployees && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditRoles(employee)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            title="Edit roles"
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

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Employee
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage settings for {editingEmployee.full_name || editingEmployee.email}
              </p>
            </div>

            {roleError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {roleError}
              </div>
            )}

            {/* Business Role Selection */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Business Role <span className="text-red-500">*</span>
              </h3>
              <div className="space-y-2">
                {BUSINESS_ROLES.map((role) => {
                  const style = roleStyles[role];
                  const isSelected = selectedBusinessRole === role;

                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedBusinessRole(role)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                          : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${style.className}`}>
                        {style.icon}
                      </span>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {ROLE_LABELS[role]}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {ROLE_DESCRIPTIONS[role]}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add-on Roles */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Add-on Roles <span className="text-gray-400">(Optional)</span>
              </h3>
              <div className="space-y-2">
                {ADD_ON_ROLES.map((role) => {
                  const style = roleStyles[role];
                  const isSelected = selectedAddOns.has(role);

                  return (
                    <button
                      key={role}
                      onClick={() => handleToggleAddOn(role)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                          : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${style.className}`}>
                        {style.icon}
                      </span>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {ROLE_LABELS[role]}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {ROLE_DESCRIPTIONS[role]}
                        </p>
                      </div>
                      <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name Editing - Only for lead_developer or owner */}
            {isLeadDeveloperOrOwner && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Employee Name
                </h3>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Enter employee name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            )}

            {/* Password Reset - Only for lead_developer or owner */}
            {isLeadDeveloperOrOwner && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reset Password <span className="text-gray-400">(Optional)</span>
                </h3>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  Leave blank to keep current password. Minimum 12 characters.
                </p>
                <input
                  type="password"
                  value={editingPassword}
                  onChange={(e) => setEditingPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={12}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            )}

            {/* Default Location - For users with global access roles OR when current user is lead_developer/owner */}
            {(() => {
              // Check if the selected roles include a global access role
              const selectedRoles = [selectedBusinessRole, ...Array.from(selectedAddOns)];
              const hasGlobalAccess = selectedRoles.some(r =>
                GLOBAL_ACCESS_ROLES.includes(r as typeof GLOBAL_ACCESS_ROLES[number])
              );

              // Show if employee has global access OR if current user is lead_developer/owner
              if ((!hasGlobalAccess && !isLeadDeveloperOrOwner) || locations.length === 0) return null;

              return (
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Default Location <span className="text-gray-400">(For multi-location access)</span>
                  </h3>
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                    This location will be pre-selected when the employee opens the portal.
                  </p>
                  <div className="space-y-2">
                    {locations.map((location) => (
                      <button
                        key={location.slug}
                        onClick={() => setSelectedDefaultLocation(
                          selectedDefaultLocation === location.slug ? null : location.slug
                        )}
                        disabled={!location.is_active}
                        className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-colors ${
                          selectedDefaultLocation === location.slug
                            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                            : location.is_active
                              ? 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                              : 'border-gray-200 opacity-50 cursor-not-allowed dark:border-gray-700'
                        }`}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </span>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {location.name}
                          </p>
                          {!location.is_active && (
                            <p className="text-xs text-gray-400">Coming Soon</p>
                          )}
                        </div>
                        {selectedDefaultLocation === location.slug && (
                          <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingEmployee(null)}
                disabled={savingRoles}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoles}
                disabled={savingRoles}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingRoles && <Loader2 className="h-4 w-4 animate-spin" />}
                {savingRoles ? 'Saving...' : 'Save Changes'}
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
