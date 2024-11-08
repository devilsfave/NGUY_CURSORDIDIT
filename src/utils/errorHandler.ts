import { toast } from 'react-toastify';
import { FirebaseError } from 'firebase/app';

interface ErrorConfig {
  silent?: boolean;
  retry?: boolean;
  fallback?: any;
  severity?: 'error' | 'warning' | 'info';
  context?: string;
  additionalInfo?: string;
}

export const handleError = async (
  error: unknown,
  context: string = '',
  config: ErrorConfig = {}
) => {
  const { silent = false, retry = false, fallback = null, severity = 'error' } = config;

  // Get appropriate error message
  let message = 'An unexpected error occurred';
  
  if (error instanceof FirebaseError) {
    // Handle Firebase specific errors
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'User not found. Please check your credentials.';
        break;
      case 'auth/wrong-password':
        message = 'Invalid password. Please try again.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Please try again later.';
        break;
      case 'permission-denied':
        message = 'You do not have permission to perform this action.';
        break;
      default:
        message = error.message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Log error for debugging
  console.error(`Error in ${context}:`, error);

  // Show toast notification if not silent
  if (!silent) {
    switch (severity) {
      case 'warning':
        toast.warning(message);
        break;
      case 'info':
        toast.info(message);
        break;
      default:
        toast.error(message);
    }
  }

  // Retry logic if needed
  if (retry) {
    return await retryOperation(
      async () => {
        throw error; // Re-throw to trigger retry
      },
      3, // Max attempts
      1000 // Delay between retries
    );
  }

  return fallback;
};

// Helper function for retrying operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Common error messages
export const ErrorMessages = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_INPUT: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment.',
  INVALID_IMAGE: 'Invalid image format or corrupted file.',
  PROCESSING_ERROR: 'Error processing image. Please try again.'
} as const;

// Usage example:
/*
try {
  // Your code
} catch (error) {
  await handleError(error, 'UploadImage', {
    retry: true,
    severity: 'warning',
    context: 'Uploading profile picture'
  });
}
*/