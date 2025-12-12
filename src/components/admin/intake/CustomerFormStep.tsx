'use client';

import { useState, useEffect } from 'react';
import { Building2, User, Lock, Search, Loader2, AlertCircle } from 'lucide-react';
import type { RepairShoprCustomer, RepairShoprBusiness } from '@/lib/repairshopr';

// =============================================================================
// Types
// =============================================================================

interface CustomerFormStepProps {
  customerType: 'individual' | 'business';
  onCustomerCreated: (customer: RepairShoprCustomer) => void;
  onBack: () => void;
}

interface FormData {
  // Individual/Contact fields
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  // Business fields
  business_name: string;
  // Portal password
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

// =============================================================================
// Component
// =============================================================================

export function CustomerFormStep({
  customerType,
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
    business_name: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Business search state
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [isSearchingBusinesses, setIsSearchingBusinesses] = useState(false);
  const [searchResults, setSearchResults] = useState<RepairShoprBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<RepairShoprBusiness | null>(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);

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
      case 'business_name':
        if (customerType === 'business' && !value.trim()) {
          return 'Business name is required';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Common fields
    newErrors.firstname = validateField('firstname', formData.firstname);
    newErrors.lastname = validateField('lastname', formData.lastname);
    newErrors.email = validateField('email', formData.email);
    newErrors.phone = validateField('phone', formData.phone);
    newErrors.password = validateField('password', formData.password);
    newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);

    // Business-specific validation
    if (customerType === 'business') {
      newErrors.business_name = validateField('business_name', formData.business_name);
    }

    // Remove empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================================================================
  // Business Search
  // =============================================================================

  const handleBusinessSearch = async () => {
    if (!businessSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearchingBusinesses(true);
    try {
      const response = await fetch(
        `/api/repairshopr/businesses?q=${encodeURIComponent(businessSearchQuery)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search businesses');
      }

      const data = await response.json();
      setSearchResults(data.businesses || []);
    } catch (error) {
      console.error('Business search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearchingBusinesses(false);
    }
  };

  const handleSelectBusiness = (business: RepairShoprBusiness) => {
    setSelectedBusiness(business);
    setFormData({ ...formData, business_name: business.name });
    setBusinessSearchQuery(business.name);
    setSearchResults([]);
    setShowBusinessForm(false);
  };

  const handleCreateNewBusiness = () => {
    setSelectedBusiness(null);
    setFormData({ ...formData, business_name: businessSearchQuery });
    setShowBusinessForm(true);
    setSearchResults([]);
  };

  // Trigger search on query change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (businessSearchQuery.trim()) {
        handleBusinessSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [businessSearchQuery]);

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
        password: formData.password, // For portal account creation
      };

      // Add optional address fields if provided
      if (formData.address.trim()) customerData.address = formData.address.trim();
      if (formData.city.trim()) customerData.city = formData.city.trim();
      if (formData.state.trim()) customerData.state = formData.state.trim();
      if (formData.zip.trim()) customerData.zip = formData.zip.trim();

      // Add business name for business customers
      if (customerType === 'business' && formData.business_name.trim()) {
        customerData.business_name = formData.business_name.trim();
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
    <div className="rounded-lg bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        {customerType === 'individual' ? 'New Individual Customer' : 'New Business Customer'}
      </h2>

      {submitError && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Search (for business customers) */}
        {customerType === 'business' && !showBusinessForm && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <Building2 className="mr-1 inline-block h-4 w-4" />
              Business Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={businessSearchQuery}
                onChange={(e) => setBusinessSearchQuery(e.target.value)}
                placeholder="Search for existing business or enter new name..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {isSearchingBusinesses && (
                <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-gray-400" />
              )}
              {!isSearchingBusinesses && businessSearchQuery && (
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-medium text-gray-500">
                    Existing Businesses
                  </p>
                  {searchResults.map((business) => (
                    <button
                      key={business.id}
                      type="button"
                      onClick={() => handleSelectBusiness(business)}
                      className="w-full rounded px-3 py-2 text-left hover:bg-gray-100"
                    >
                      <p className="font-medium text-gray-900">{business.name}</p>
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-200 p-2">
                  <button
                    type="button"
                    onClick={handleCreateNewBusiness}
                    className="w-full rounded px-3 py-2 text-left text-purple-600 hover:bg-purple-50"
                  >
                    + Create new business "{businessSearchQuery}"
                  </button>
                </div>
              </div>
            )}

            {/* Show "Create new" if no results */}
            {businessSearchQuery &&
              !isSearchingBusinesses &&
              searchResults.length === 0 && (
                <button
                  type="button"
                  onClick={handleCreateNewBusiness}
                  className="mt-2 w-full rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-left text-purple-700 hover:bg-purple-100"
                >
                  + Create new business "{businessSearchQuery}"
                </button>
              )}

            {errors.business_name && (
              <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
            )}
          </div>
        )}

        {/* Business Address Fields (if creating new business) */}
        {customerType === 'business' && showBusinessForm && (
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">Business Information</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.business_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-gray-600">Address (optional)</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="KS"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Person Fields */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">
            <User className="mr-1 inline-block h-4 w-4" />
            {customerType === 'business' ? 'Contact Person' : 'Customer Information'}
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.firstname && (
                <p className="mt-1 text-sm text-red-600">{errors.firstname}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.lastname && (
                <p className="mt-1 text-sm text-red-600">{errors.lastname}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>

          {/* Address (optional for individuals) */}
          {customerType === 'individual' && (
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">Address (optional)</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="ZIP"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Portal Password Section */}
        <div className="space-y-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm font-medium text-gray-700">
            <Lock className="mr-1 inline-block h-4 w-4" />
            Customer Portal Password
          </p>
          <p className="text-xs text-gray-600">
            This password will allow the customer to access their repair status online.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Minimum 8 characters"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Re-enter password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
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
            className="rounded-lg bg-white px-6 py-3 font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-medium text-white hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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
    </div>
  );
}
