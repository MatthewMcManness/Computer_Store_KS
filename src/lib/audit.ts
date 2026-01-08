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

/**
 * Get audit logs for a specific employee
 */
export async function getEmployeeAuditLogs(
  employeeUserId: string,
  options: {
    limit?: number;
    offset?: number;
    actionCategory?: AuditActionCategory;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<AuditLogRecord[]> {
  const supabase = createFreshAdminClient();
  if (!supabase) return [];

  const { limit = 50, offset = 0, actionCategory, startDate, endDate } = options;

  let query = supabase
    .from('employee_audit_log')
    .select('*')
    .eq('employee_user_id', employeeUserId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (actionCategory) {
    query = query.eq('action_category', actionCategory);
  }

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('[AUDIT] Failed to fetch employee audit logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all audit logs (admin only)
 */
export async function getAllAuditLogs(
  options: {
    limit?: number;
    offset?: number;
    actionCategory?: AuditActionCategory;
    actionType?: string;
    employeeEmail?: string;
    targetType?: string;
    targetId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<AuditLogRecord[]> {
  const supabase = createFreshAdminClient();
  if (!supabase) return [];

  const {
    limit = 50,
    offset = 0,
    actionCategory,
    actionType,
    employeeEmail,
    targetType,
    targetId,
    startDate,
    endDate,
  } = options;

  let query = supabase
    .from('employee_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (actionCategory) {
    query = query.eq('action_category', actionCategory);
  }

  if (actionType) {
    query = query.eq('action_type', actionType);
  }

  if (employeeEmail) {
    query = query.eq('employee_email', employeeEmail);
  }

  if (targetType) {
    query = query.eq('target_type', targetType);
  }

  if (targetId) {
    query = query.eq('target_id', targetId);
  }

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('[AUDIT] Failed to fetch all audit logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Get audit logs for a specific target (e.g., all actions on a ticket)
 */
export async function getTargetAuditLogs(
  targetType: string,
  targetId: string,
  options: {
    limit?: number;
    offset?: number;
  } = {}
): Promise<AuditLogRecord[]> {
  const supabase = createFreshAdminClient();
  if (!supabase) return [];

  const { limit = 50, offset = 0 } = options;

  const { data, error } = await supabase
    .from('employee_audit_log')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[AUDIT] Failed to fetch target audit logs:', error);
    return [];
  }

  return data || [];
}

// =============================================================================
// Convenience Functions for Common Actions
// =============================================================================

/**
 * Log a ticket action
 */
export async function logTicketAction(
  employee: EmployeeInfo,
  actionType: 'ticket_create' | 'ticket_update' | 'ticket_view' | 'ticket_comment' | 'ticket_status_change',
  ticketId: string | number,
  ticketName?: string,
  changes?: Record<string, unknown>,
  request?: NextRequest
): Promise<boolean> {
  return logEmployeeAction(
    employee,
    {
      actionType,
      actionCategory: 'ticket',
      targetType: 'ticket',
      targetId: String(ticketId),
      targetName: ticketName,
      changes,
    },
    request
  );
}

/**
 * Log a customer action
 */
export async function logCustomerAction(
  employee: EmployeeInfo,
  actionType: 'customer_create' | 'customer_update' | 'customer_view' | 'customer_search',
  customerId?: string | number,
  customerName?: string,
  changes?: Record<string, unknown>,
  request?: NextRequest
): Promise<boolean> {
  return logEmployeeAction(
    employee,
    {
      actionType,
      actionCategory: 'customer',
      targetType: 'customer',
      targetId: customerId ? String(customerId) : undefined,
      targetName: customerName,
      changes,
    },
    request
  );
}

/**
 * Log an asset action
 */
export async function logAssetAction(
  employee: EmployeeInfo,
  actionType: 'asset_create' | 'asset_update' | 'asset_view',
  assetId?: string | number,
  assetName?: string,
  changes?: Record<string, unknown>,
  request?: NextRequest
): Promise<boolean> {
  return logEmployeeAction(
    employee,
    {
      actionType,
      actionCategory: 'asset',
      targetType: 'asset',
      targetId: assetId ? String(assetId) : undefined,
      targetName: assetName,
      changes,
    },
    request
  );
}

/**
 * Log a POS action
 */
export async function logPOSAction(
  employee: EmployeeInfo,
  actionType: 'invoice_create' | 'invoice_update' | 'payment_create' | 'line_item_add' | 'line_item_remove',
  invoiceId?: string | number,
  invoiceName?: string,
  changes?: Record<string, unknown>,
  request?: NextRequest
): Promise<boolean> {
  return logEmployeeAction(
    employee,
    {
      actionType,
      actionCategory: 'pos',
      targetType: 'invoice',
      targetId: invoiceId ? String(invoiceId) : undefined,
      targetName: invoiceName,
      changes,
    },
    request
  );
}

/**
 * Log an authentication action
 */
export async function logAuthAction(
  employee: EmployeeInfo,
  actionType: 'login' | 'logout' | 'password_change' | 'session_refresh',
  request?: NextRequest
): Promise<boolean> {
  return logEmployeeAction(
    employee,
    {
      actionType,
      actionCategory: 'auth',
    },
    request
  );
}
