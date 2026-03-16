'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  User,
  Shield,
  Wrench,
  UserCheck,
  Crown,
  Briefcase,
  Share2,
  Code2,
  Link2,
  Loader2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import {
  type BusinessRole,
  type AddOnRole,
  BUSINESS_ROLES,
  ADD_ON_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
} from '@/types/roles';

/**
 * Configuration for business role selection options.
 * Each role includes label, description, and icon for UI display.
 */
const businessRoleOptions: { value: BusinessRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'owner',
    label: ROLE_LABELS.owner,
    description: ROLE_DESCRIPTIONS.owner,
    icon: <Shield className="h-5 w-5" />,
  },
  {
    value: 'manager',
    label: ROLE_LABELS.manager,
    description: ROLE_DESCRIPTIONS.manager,
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    value: 'lead_technician',
    label: ROLE_LABELS.lead_technician,
    description: ROLE_DESCRIPTIONS.lead_technician,
    icon: <Crown className="h-5 w-5" />,
  },
  {
    value: 'technician',
    label: ROLE_LABELS.technician,
    description: ROLE_DESCRIPTIONS.technician,
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    value: 'receptionist',
    label: ROLE_LABELS.receptionist,
    description: ROLE_DESCRIPTIONS.receptionist,
    icon: <UserCheck className="h-5 w-5" />,
  },
];

/**
 * Configuration for add-on role options.
 * These are optional roles that can be combined with a business role.
 */
const addOnRoleOptions: { value: AddOnRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'social_media',
    label: ROLE_LABELS.social_media,
    description: ROLE_DESCRIPTIONS.social_media,
    icon: <Share2 className="h-5 w-5" />,
  },
  {
    value: 'lead_developer',
    label: ROLE_LABELS.lead_developer,
    description: ROLE_DESCRIPTIONS.lead_developer,
    icon: <Code2 className="h-5 w-5" />,
  },
];

/**
 * New Employee page with multi-role selection.
 *
 * Allows creating new employees with:
 * - One required business role (receptionist → owner hierarchy)
 * - Optional add-on roles (social_media, lead_developer)
 *
 * @returns New employee form page
 *
 * @functions_called fetch, useRouter, useState, useEffect
 * @called_by AdminLayout, EmployeesPage
 *
 * @version 1.0.0 - 2026-01-11T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-11T00:00:00Z - Updated for multi-role support
 */
export default function NewEmployeePage() {
  const router = useRouter();
  const [canManageEmployees, setCanManageEmployees] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    businessRole: 'technician' as BusinessRole,
    addOnRoles: [] as AddOnRole[],
    repairshopr_user_id: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Check authentication and permission status
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
          const roles = data.user?.roles || [];
          // Check if user can manage employees (manager, owner, or lead_developer)
          const hasPermission = roles.some((r: string) =>
            ['manager', 'owner', 'lead_developer'].includes(r)
          ) || data.user?.role === 'admin'; // Legacy fallback

          if (!hasPermission) {
            router.push('/admin/employees');
            return;
          }
          setCanManageEmployees(true);
        }
        setAuthChecked(true);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleBusinessRoleChange = (role: BusinessRole) => {
    setFormData(prev => ({ ...prev, businessRole: role }));
    setError(null);
  };

  const handleAddOnRoleToggle = (role: AddOnRole) => {
    setFormData(prev => {
      const newAddOnRoles = prev.addOnRoles.includes(role)
        ? prev.addOnRoles.filter(r => r !== role)
        : [...prev.addOnRoles, role];
      return { ...prev, addOnRoles: newAddOnRoles };
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validation
    if (!formData.email.trim()) {
      setError('Email is required');
      setSubmitting(false);
      return;
    }

    if (!formData.full_name.trim()) {
      setError('Full name is required');
      setSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setSubmitting(false);
      return;
    }

    // Build roles array: business role + add-on roles
    const roles = [formData.businessRole, ...formData.addOnRoles];

    try {
      const response = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          full_name: formData.full_name.trim(),
          roles,
          repairshopr_user_id: formData.repairshopr_user_id.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create employee');
      }

      setToast({
        type: 'success',
        message: `Invitation sent to ${formData.email}. They will receive an email to set their password.`,
      });

      // Redirect after short delay
      setTimeout(() => {
        router.push('/admin/employees');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked || !canManageEmployees) {
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
          <span className="max-w-md">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/admin/employees"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Add New Employee</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Send an invitation email to onboard a new employee
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-6">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Mail className="h-4 w-4" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="employee@thecomputerstoreks.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              disabled={submitting}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              An invitation email will be sent to this address
            </p>
          </div>

          {/* Full Name Field */}
          <div className="mb-6">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="John Smith"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              disabled={submitting}
            />
          </div>

          {/* Business Role Selection */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Business Role <span className="text-red-500">*</span>
            </label>
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Select one primary role that defines their access level
            </p>
            <div className="space-y-3">
              {businessRoleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleBusinessRoleChange(option.value)}
                  disabled={submitting}
                  className={`flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors ${
                    formData.businessRole === option.value
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      formData.businessRole === option.value
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {option.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                  </div>
                  {formData.businessRole === option.value && (
                    <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Add-on Roles (Optional) */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Add-on Roles <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
            </label>
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Additional roles that grant extra permissions
            </p>
            <div className="space-y-3">
              {addOnRoleOptions.map((option) => {
                const isSelected = formData.addOnRoles.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAddOnRoleToggle(option.value)}
                    disabled={submitting}
                    className={`flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/30'
                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isSelected
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {option.icon}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                    </div>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RepairShopr User ID (Optional) */}
          <div className="mb-6">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Link2 className="h-4 w-4" />
              RepairShopr User ID
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.repairshopr_user_id}
              onChange={(e) => handleInputChange('repairshopr_user_id', e.target.value)}
              placeholder="12345"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              disabled={submitting}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Link this account to a RepairShopr user for API access
            </p>
          </div>

          {/* Selected Roles Summary */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Assigned Roles</h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                {ROLE_LABELS[formData.businessRole]}
              </span>
              {formData.addOnRoles.map(role => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                >
                  + {ROLE_LABELS[role]}
                </span>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
            <h3 className="font-medium text-blue-900 dark:text-blue-200">What happens next?</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>1. The employee will receive an invitation email</li>
              <li>2. They click the link to set their password</li>
              <li>3. Once set up, they can log in to the employee portal</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <Link
              href="/admin/employees"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
