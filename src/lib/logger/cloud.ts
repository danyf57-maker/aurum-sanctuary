/**
 * Google Cloud Error Reporting Integration
 * 
 * Server-side error reporting for Cloud Functions.
 * Use this in Cloud Functions to report errors to Google Cloud Error Reporting.
 */

import { logger as safeLogger } from './safe';

/**
 * Report error to Google Cloud Error Reporting
 * 
 * Note: This is a placeholder for Google Cloud Error Reporting integration.
 * In production, use @google-cloud/error-reporting package.
 * 
 * @param message - Error message
 * @param error - Error object
 * @param context - Additional context
 */
export function reportError(message: string, error?: Error | unknown, context?: Record<string, any>) {
    // For now, use safe logging
    // In production, replace with:
    // import { ErrorReporting } from '@google-cloud/error-reporting';
    // const errors = new ErrorReporting();
    // errors.report(error, { user: context?.hashedUserId, ... });

    safeLogger.errorSafe(message, error, context);

    // TODO: Integrate with Google Cloud Error Reporting
    // if (process.env.NODE_ENV === 'production') {
    //   errors.report(error || new Error(message), {
    //     user: context?.hashedUserId,
    //     httpRequest: context?.httpRequest,
    //   });
    // }
}

export const cloudLogger = {
    reportError,
};
