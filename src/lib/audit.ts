/**
 * Employee Audit Logging
 *
 * Tracks all employee actions in the system for accountability and compliance.
 * All actions using the shared RepairShopr API key are logged with the
 * individual employee's identity.
 */

import { NextRequest } from 'next/server';
import { createFreshAdminClient } from './supabase';

// =============================================================================
// Types
// =============================================================================

export type AuditActionCategory = 'ticket' | 'customer' | 'pos' | 'asset' | 'auth' | 'admin';

export interface AuditLogEntry {
  actionType: string;
  actionCategory: AuditActionCategory;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  changes?: Record<string, unknown>;
  requestData?: Record<string, unknown>;
}

export interface EmployeeInfo {
  userId: string;
  email: string;
  name?: string;
}

export interface AuditLogRecord {
  id: string;
  employee_user_id: string;
  employee_email: string;
  employee_name: string | null;
  action_type: string;
  action_category: string;
  target_type: string | null;
  target_id: string | null;
  target_name: string | null;
  changes: Record<string, unknown> | null;
  request_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extract client IP from request headers
 */
function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIP = forwarded.split(',')[0];
    return firstIP?.trim() || null;
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return null;
}

/**
 * Extract user agent from request headers
 */
function getUserAgent(request: NextRequest): string | null {
  return request.headers.get('user-agent');
}

/**
 * Sanitize request data by removing sensitive fields
 */
function sanitizeRequestData(
  data: Record<string, unknown> | undefined
): Record<string, unknown> | null {
  if (!data) return null;

  const sensitiveFields = ['password', 'token', 'api_key', 'apiKey', 'secret', 'authorization'];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeRequestData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// =============================================================================
// Main Audit Functions
// =============================================================================

/**
 * Log an employee action to the audit log
 *
 * @param employee - The employee performing the action
 * @param entry - The audit log entry details
 * @param request - The NextRequest object (optional, for IP and user agent)
 */
export async function logEmployeeAction(
  employee: EmployeeInfo,
  entry: AuditLogEntry,
  request?: NextRequest
): Promise<boolean> {
  const supabase = createFreshAdminClient();
  if (!supabase) {
    console.error('[AUDIT] Cannot log action: Supabase admin client not available');
    return false;
  }

  try {
    const { error } = await supabase.from('employee_audit_log').insert({
      employee_user_id: employee.userId,
      employee_email: employee.email,
      employee_name: employee.name || null,
      action_type: entry.actionType,
      action_category: entry.actionCategory,
      target_type: entry.targetType || null,
      target_id: entry.targetId || null,
      target_name: entry.targetName || null,
      changes: entry.changes || null,
      request_data: sanitizeRequestData(entry.requestData),
      ip_address: request ? getClientIP(request) : null,
      user_agent: request ? getUserAgent(request) : null,
    });

    if (error) {
      console.error('[AUDIT] Failed to log action:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[AUDIT] Error logging action:', error);
    return false;
  }
}

