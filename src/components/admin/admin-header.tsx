'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Menu,
  User,
  Building2,
  Ticket,
  FileText,
  Loader2,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDarkMode } from '@/hooks/useDarkMode';
import type { SidebarMode } from './admin-shell';

/**
 * Protection plan tier identifier for customers/businesses.
 */
type ProtectionPlanTier = 'eset' | 'silver' | 'silver-plus' | null;

/**
 * Search result item structure returned from admin search API.
 */
interface SearchResult {
  id: string | number;
  type: 'customer' | 'business' | 'ticket' | 'invoice';
  title: string;
  subtitle?: string;
  href: string;
  protectionPlan?: ProtectionPlanTier;
}

/**
 * Props for the AdminHeader component.
 */
interface AdminHeaderProps {
  onMenuToggle: () => void;
  onSidebarToggle: () => void;
  sidebarMode: SidebarMode;
  isMobileMenuOpen: boolean;
}

/**
 * Admin dashboard header with search, navigation toggles, and dark mode.
 *
 * Renders a sticky header containing:
 * - Mobile menu toggle button
 * - Desktop sidebar collapse/expand toggle
 * - Centered search bar with autocomplete for customers, businesses, tickets, and invoices
 * - Dark mode toggle button
 *
 * @param props - Component properties
 * @param props.onMenuToggle - Callback to toggle mobile menu visibility
 * @param props.onSidebarToggle - Callback to cycle through sidebar modes (expanded/collapsed/hidden)
 * @param props.sidebarMode - Current sidebar display mode
 * @param props.isMobileMenuOpen - Whether mobile menu is currently open
 *
 * @returns {JSX.Element} Sticky header component
 *
 * @sideEffects
 * - Makes API calls to `/api/admin/search` for debounced search
 * - Adds/removes click and keyboard event listeners for dropdown behavior
 * - Updates browser history on navigation via router.push
 *
 * @example
 * <AdminHeader
 *   onMenuToggle={() => setMobileOpen(!mobileOpen)}
 *   onSidebarToggle={cycleSidebarMode}
 *   sidebarMode="expanded"
 *   isMobileMenuOpen={false}
 * />
 *
 * @functions_called useDarkMode, useRouter
 * @called_by AdminShell
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
export function AdminHeader({ onMenuToggle, onSidebarToggle, sidebarMode, isMobileMenuOpen }: AdminHeaderProps) {
  const router = useRouter();
  const { isDark, toggle } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showResults || searchResults.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            navigateToResult(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowResults(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [showResults, searchResults, selectedIndex]
  );

  const navigateToResult = (result: SearchResult) => {
    setShowResults(false);
    setSearchQuery('');
    setSelectedIndex(-1);
    router.push(result.href);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'customer':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'business':
        return <Building2 className="h-4 w-4 text-purple-500" />;
      case 'ticket':
        return <Ticket className="h-4 w-4 text-green-500" />;
      case 'invoice':
        return <FileText className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'customer':
        return 'Customer';
      case 'business':
        return 'Business';
      case 'ticket':
        return 'Ticket';
      case 'invoice':
        return 'Invoice';
      default:
        return '';
    }
  };

  const getProtectionPlanBadge = (plan: ProtectionPlanTier) => {
    if (!plan) return null;
    switch (plan) {
      case 'silver-plus':
        return (
          <span className="silver-plus-plan-badge px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
            Silver+
          </span>
        );
      case 'silver':
        return (
          <span className="silver-plan-badge px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
            Silver
          </span>
        );
      case 'eset':
        return (
          <span className="eset-plan-badge px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
            ESET
          </span>
        );
      default:
        return null;
    }
  };

  // Get sidebar toggle icon and label based on current mode
  const getSidebarToggleInfo = () => {
    switch (sidebarMode) {
      case 'expanded':
        return { icon: <PanelLeftClose className="h-5 w-5" />, label: 'Collapse sidebar' };
      case 'collapsed':
        return { icon: <PanelLeft className="h-5 w-5" />, label: 'Hide sidebar' };
      case 'hidden':
        return { icon: <PanelLeftOpen className="h-5 w-5" />, label: 'Show sidebar' };
    }
  };

  const sidebarToggleInfo = getSidebarToggleInfo();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-full items-center">
        {/* Left section - menu toggles */}
        <div className="flex items-center gap-2 px-2 sm:px-4 lg:px-4 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={onSidebarToggle}
            className="hidden lg:flex rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label={sidebarToggleInfo.label}
            title={sidebarToggleInfo.label}
          >
            {sidebarToggleInfo.icon}
          </button>
        </div>

        {/* Center section - Search bar (always centered) */}
        <div className="flex-1 flex justify-center px-2 sm:px-4">
          <div ref={searchRef} className="relative w-full max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:bg-gray-900"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
              )}
              {searchQuery && !isSearching && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowResults(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute left-0 right-0 top-full mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {searchResults.map((result, index) => (
                      <li key={`${result.type}-${result.id}`}>
                        <button
                          onClick={() => navigateToResult(result)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                            selectedIndex === index
                              ? 'bg-blue-50 dark:bg-blue-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          )}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            {getTypeIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{result.title}</p>
                              {result.protectionPlan && getProtectionPlanBadge(result.protectionPlan)}
                            </div>
                            {result.subtitle && (
                              <p className="text-xs text-gray-500 truncate dark:text-gray-400">{result.subtitle}</p>
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">
                            {getTypeLabel(result.type)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right section - dark mode toggle */}
        <div className="flex items-center flex-shrink-0">
          {/* Dark mode toggle - square filling header height, locked to right edge */}
          <button
            onClick={toggle}
            className="flex h-16 w-16 items-center justify-center border-l border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 transition-all hover:from-gray-100 hover:to-gray-200 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-6 w-6 text-amber-500" /> : <Moon className="h-6 w-6 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
