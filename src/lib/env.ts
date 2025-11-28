/**
 * Environment Configuration Validation
 *
 * This module validates that all required environment variables are set
 * based on the current AUTH_MODE. Import this at app startup to fail fast.
 *
 * @module env
 */

/**
 * Get the current authentication mode
 */
export function getAuthMode(): 'repairshopr' | 'legacy' {
  const mode = process.env.AUTH_MODE || 'repairshopr';
  return mode === 'legacy' ? 'legacy' : 'repairshopr';
}

/**
 * Validation errors collected during startup
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all required authentication configuration
 * Call this at app startup to fail fast on misconfiguration
 *
 * @returns ValidationResult with any errors or warnings
 * @throws Error if critical configuration is missing (when throwOnError=true)
 */
export function validateAuthConfig(throwOnError = true): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const mode = getAuthMode();

  // RepairShopr mode requirements
  if (mode === 'repairshopr') {
    if (!process.env.REPAIRSHOPR_SUBDOMAIN) {
      errors.push(
        'REPAIRSHOPR_SUBDOMAIN is required when AUTH_MODE=repairshopr. ' +
          'Set your RepairShopr subdomain (e.g., "thecomputerstore" for thecomputerstore.repairshopr.com)'
      );
    }

    // Session secret is required for encrypted sessions
    if (!process.env.SESSION_SECRET) {
      errors.push(
        'SESSION_SECRET is required when AUTH_MODE=repairshopr. ' +
          'Generate with: openssl rand -hex 16 | head -c 32'
      );
    } else if (process.env.SESSION_SECRET.length !== 32) {
      errors.push(
        `SESSION_SECRET must be exactly 32 characters (got ${process.env.SESSION_SECRET.length}). ` +
          'Generate with: openssl rand -hex 16 | head -c 32'
      );
    }
  }

  // Legacy mode requirements
  if (mode === 'legacy') {
    if (!process.env.ADMIN_PASSWORD && !process.env.LEGACY_ADMIN_PASSWORD) {
      errors.push(
        'ADMIN_PASSWORD or LEGACY_ADMIN_PASSWORD is required when AUTH_MODE=legacy'
      );
    }

    // Warn if using weak password
    const password =
      process.env.LEGACY_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    if (password && password.length < 8) {
      warnings.push(
        'Admin password is less than 8 characters. Consider using a stronger password.'
      );
    }
  }

  // Warnings for both modes
  if (!process.env.NODE_ENV) {
    warnings.push(
      'NODE_ENV is not set. Defaulting to development mode (insecure cookies).'
    );
  }

  // Check if legacy fallback is available
  if (mode === 'repairshopr') {
    if (!process.env.LEGACY_ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD) {
      warnings.push(
        'No legacy fallback password configured. ' +
          'Set LEGACY_ADMIN_PASSWORD to enable fallback if RepairShopr is unavailable.'
      );
    }
  }

  const result: ValidationResult = {
    valid: errors.length === 0,
    errors,
    warnings,
  };

  if (throwOnError && !result.valid) {
    const errorMessage =
      'Environment configuration errors:\n' +
      errors.map((e) => `  - ${e}`).join('\n');
    throw new Error(errorMessage);
  }

  return result;
}

/**
 * Log validation results to console
 * Useful for debugging configuration issues
 */
export function logValidationResult(result: ValidationResult): void {
  const mode = getAuthMode();
  console.log(`[ENV] Auth mode: ${mode}`);

  if (result.errors.length > 0) {
    console.error('[ENV] Configuration errors:');
    result.errors.forEach((e) => console.error(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    console.warn('[ENV] Configuration warnings:');
    result.warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (result.valid) {
    console.log('[ENV] Configuration valid ✓');
  }
}

/**
 * Get a summary of current auth configuration (safe to log)
 * Does not include sensitive values
 */
export function getAuthConfigSummary(): Record<string, string | boolean> {
  return {
    AUTH_MODE: getAuthMode(),
    REPAIRSHOPR_SUBDOMAIN: process.env.REPAIRSHOPR_SUBDOMAIN || '(not set)',
    SESSION_SECRET_SET: !!process.env.SESSION_SECRET,
    SESSION_SECRET_LENGTH: process.env.SESSION_SECRET?.length || 0,
    LEGACY_PASSWORD_SET:
      !!(process.env.LEGACY_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD),
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}
