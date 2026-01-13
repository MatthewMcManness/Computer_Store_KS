'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Search, Loader2, AlertCircle, Eye, EyeOff, X, Plus, Users, Building2 } from 'lucide-react';
import type { RepairShoprCustomer } from '@/lib/repairshopr';

// =============================================================================
// Types
// =============================================================================

interface CustomerFormStepProps {
  onCustomerCreated: (customer: RepairShoprCustomer) => void;
  onBack: () => void;
}

interface FormData {
  // Contact fields
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  // Portal password
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

interface Family {
  id: number;
  name: string;
  customerCount?: number;
}

interface Business {
  id: number;
  name: string;
  customerCount?: number;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Customer form for creating new customers with optional family and business associations.
 *
 * @param onCustomerCreated - Callback when customer is successfully created
 * @param onBack - Callback to go back to previous step
 *
 * @functions_called validateField, validateForm, handleSubmit
 * @called_by IntakeWizard
 *
 * @version 1.0.0 - 2026-01-13T00:00:00Z - Initial implementation
 * @version 2.0.0 - 2026-01-13T00:00:00Z - Removed individual/business distinction, added family/business multi-select
 */
export function CustomerFormStep({
  onCustomerCreated,
  onBack,
}: CustomerFormStepProps) {
  const [formData, setFormData] = useState<FormData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =============================================================================
  // Family Multi-Select State
  // =============================================================================
  const [familySearchQuery, setFamilySearchQuery] = useState('');
  const [isSearchingFamilies, setIsSearchingFamilies] = useState(false);
  const [familySearchResults, setFamilySearchResults] = useState<Family[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<Family[]>([]);
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);

  // =============================================================================
  // Business Multi-Select State
  // =============================================================================
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [isSearchingBusinesses, setIsSearchingBusinesses] = useState(false);
  const [businessSearchResults, setBusinessSearchResults] = useState<Business[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Business[]>([]);
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [isCreatingBusiness, setIsCreatingBusiness] = useState(false);

  // =============================================================================
  // Validation
  // =============================================================================

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstname':
        return value.trim() ? '' : 'First name is required';
      case 'lastname':
        return value.trim() ? '' : 'Last name is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone is required';
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 10) return 'Phone must be at least 10 digits';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    newErrors.firstname = validateField('firstname', formData.firstname);
    newErrors.lastname = validateField('lastname', formData.lastname);
    newErrors.email = validateField('email', formData.email);
    newErrors.phone = validateField('phone', formData.phone);
    newErrors.password = validateField('password', formData.password);
    newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);

    // Remove empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================================================================
  // Family Search & Management
  // =============================================================================

  const searchFamilies = async (query: string) => {
    if (!query.trim()) {
      setFamilySearchResults([]);
      return;
    }

    setIsSearchingFamilies(true);
    try {
      const response = await fetch(`/api/repairshopr/families?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search families');
      const data = await response.json();
      // Filter out already selected families
      const filtered = (data.families || []).filter(
        (f: Family) => !selectedFamilies.some((sf) => sf.id === f.id)
      );
      setFamilySearchResults(filtered);
    } catch (error) {
      console.error('Family search error:', error);
      setFamilySearchResults([]);
    } finally {
      setIsSearchingFamilies(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (familySearchQuery.trim() && showFamilyDropdown) {
        searchFamilies(familySearchQuery);
      } else {
        setFamilySearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [familySearchQuery, showFamilyDropdown, selectedFamilies]);

  const handleSelectFamily = (family: Family) => {
    setSelectedFamilies([...selectedFamilies, family]);
    setFamilySearchQuery('');
    setFamilySearchResults([]);
    setShowFamilyDropdown(false);
  };

  const handleRemoveFamily = (familyId: number) => {
    setSelectedFamilies(selectedFamilies.filter((f) => f.id !== familyId));
  };

  const handleCreateFamily = async () => {
    if (!familySearchQuery.trim()) return;

    setIsCreatingFamily(true);
    try {
      const response = await fetch('/api/repairshopr/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: familySearchQuery.trim() }),
      });

      if (!response.ok) throw new Error('Failed to create family');
      const data = await response.json();

      // Add the new family to selected list
      setSelectedFamilies([...selectedFamilies, data.family]);
      setFamilySearchQuery('');
      setShowFamilyDropdown(false);
    } catch (error) {
      console.error('Create family error:', error);
    } finally {
      setIsCreatingFamily(false);
    }
  };

  // =============================================================================
  // Business Search & Management
  // =============================================================================

  const searchBusinesses = async (query: string) => {
    if (!query.trim()) {
      setBusinessSearchResults([]);
      return;
    }

    setIsSearchingBusinesses(true);
    try {
      const response = await fetch(`/api/repairshopr/businesses?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search businesses');
      const data = await response.json();
      // Filter out already selected businesses
      const filtered = (data.businesses || []).filter(
        (b: Business) => !selectedBusinesses.some((sb) => sb.id === b.id)
      );
      setBusinessSearchResults(filtered);
    } catch (error) {
      console.error('Business search error:', error);
      setBusinessSearchResults([]);
    } finally {
      setIsSearchingBusinesses(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (businessSearchQuery.trim() && showBusinessDropdown) {
        searchBusinesses(businessSearchQuery);
      } else {
        setBusinessSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [businessSearchQuery, showBusinessDropdown, selectedBusinesses]);

  const handleSelectBusiness = (business: Business) => {
    setSelectedBusinesses([...selectedBusinesses, business]);
    setBusinessSearchQuery('');
    setBusinessSearchResults([]);
    setShowBusinessDropdown(false);
  };

  const handleRemoveBusiness = (businessId: number) => {
    setSelectedBusinesses(selectedBusinesses.filter((b) => b.id !== businessId));
  };

  const handleCreateBusiness = async () => {
    if (!businessSearchQuery.trim()) return;

    setIsCreatingBusiness(true);
    try {
      const response = await fetch('/api/repairshopr/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: businessSearchQuery.trim() }),
      });

      if (!response.ok) throw new Error('Failed to create business');
      const data = await response.json();

      // Add the new business to selected list
      setSelectedBusinesses([...selectedBusinesses, data.business]);
      setBusinessSearchQuery('');
      setShowBusinessDropdown(false);
    } catch (error) {
      console.error('Create business error:', error);
    } finally {
      setIsCreatingBusiness(false);
    }
  };

  // =============================================================================
  // Form Handlers
  // =============================================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare customer data
      const customerData: Record<string, unknown> = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        // Include family and business IDs for linking after creation
        family_ids: selectedFamilies.map((f) => f.id),
        business_ids: selectedBusinesses.map((b) => b.id),
      };

      // Add optional address fields if provided
      if (formData.address.trim()) customerData.address = formData.address.trim();
      if (formData.city.trim()) customerData.city = formData.city.trim();
      if (formData.state.trim()) customerData.state = formData.state.trim();
      if (formData.zip.trim()) customerData.zip = formData.zip.trim();

      // If a business is selected, use the first one as the primary business_name
      if (selectedBusinesses.length > 0) {
        customerData.business_name = selectedBusinesses[0].name;
      }

      // Create customer
      const response = await fetch('/api/repairshopr/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }

      const data = await response.json();

      // Success
      onCustomerCreated(data.customer);
    } catch (error) {
      console.error('Customer creation error:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create customer'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <div className="rounded-lg bg-white dark:bg-gray-900 p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        New Customer
      </h2>

      {submitError && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-red-800 dark:text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <User className="mr-1 inline-block h-4 w-4" />
            Customer Information
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.firstname && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstname}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.lastname && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastname}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="(555) 123-4567"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
            </div>
          </div>

          {/* Address (optional) */}
          <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Address (optional)</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="ZIP"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================== */}
        {/* Details Section - Family & Business Associations */}
        {/* =========================================================================== */}
        <div className="space-y-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Details</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Optionally link this customer to families and businesses. You can add multiple of each.
          </p>

          {/* Family Multi-Select */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Users className="h-4 w-4" />
              Families
            </label>

            {/* Selected Families Display */}
            {selectedFamilies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFamilies.map((family) => (
                  <div
                    key={family.id}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-800 dark:text-blue-300"
                  >
                    <Users className="h-3 w-3" />
                    {family.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveFamily(family.id)}
                      className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Family Search Input */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={familySearchQuery}
                  onChange={(e) => setFamilySearchQuery(e.target.value)}
                  onFocus={() => setShowFamilyDropdown(true)}
                  placeholder="Search or create family..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isSearchingFamilies && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {/* Family Dropdown */}
              {showFamilyDropdown && familySearchQuery.trim() && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                  {familySearchResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto p-2">
                      {familySearchResults.map((family) => (
                        <button
                          key={family.id}
                          type="button"
                          onClick={() => handleSelectFamily(family)}
                          className="w-full rounded px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{family.name}</span>
                          {family.customerCount !== undefined && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              ({family.customerCount} members)
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                    <button
                      type="button"
                      onClick={handleCreateFamily}
                      disabled={isCreatingFamily}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50"
                    >
                      {isCreatingFamily ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Create new family &ldquo;{familySearchQuery}&rdquo;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Multi-Select */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Building2 className="h-4 w-4" />
              Businesses
            </label>

            {/* Selected Businesses Display */}
            {selectedBusinesses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedBusinesses.map((business) => (
                  <div
                    key={business.id}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 text-sm font-medium text-indigo-800 dark:text-indigo-300"
                  >
                    <Building2 className="h-3 w-3" />
                    {business.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveBusiness(business.id)}
                      className="rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Business Search Input */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={businessSearchQuery}
                  onChange={(e) => setBusinessSearchQuery(e.target.value)}
                  onFocus={() => setShowBusinessDropdown(true)}
                  placeholder="Search or create business..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isSearchingBusinesses && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {/* Business Dropdown */}
              {showBusinessDropdown && businessSearchQuery.trim() && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                  {businessSearchResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto p-2">
                      {businessSearchResults.map((business) => (
                        <button
                          key={business.id}
                          type="button"
                          onClick={() => handleSelectBusiness(business)}
                          className="w-full rounded px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{business.name}</span>
                          {business.customerCount !== undefined && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              ({business.customerCount} employees)
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                    <button
                      type="button"
                      onClick={handleCreateBusiness}
                      disabled={isCreatingBusiness}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50"
                    >
                      {isCreatingBusiness ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Create new business &ldquo;{businessSearchQuery}&rdquo;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portal Password Section */}
        <div className="space-y-4 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <Lock className="mr-1 inline-block h-4 w-4" />
            Customer Portal Password
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            This password will allow the customer to access their repair status online.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Re-enter password"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="rounded-lg bg-white dark:bg-gray-800 px-6 py-3 font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 border border-gray-200 dark:border-gray-700"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Customer...
              </>
            ) : (
              'Create Customer'
            )}
          </button>
        </div>
      </form>

      {/* Click-away listener for dropdowns */}
      {(showFamilyDropdown || showBusinessDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowFamilyDropdown(false);
            setShowBusinessDropdown(false);
          }}
        />
      )}
    </div>
  );
}
