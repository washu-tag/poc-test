export const tryToCloseStream = (...streamables: any[]) => {
  for (const streamable of streamables) {
    if (streamable) {
      try {
        streamable.done();
      } catch (error: any) {
        // Ignore
      }
    }
  }
};

export const stringifyError = (error: any): string => {
  let errorMessage = 'An unexpected error occurred';

  if (error.response && error.response.data) {
    // Axios error with response data
    errorMessage = error.response.data.message || JSON.stringify(error.response.data);
  } else if (error.errors && error.errors.length > 0) {
    // Handle AxiosError where the message is in `error.errors`
    errorMessage = error.errors[0].message;
  } else if (error.message) {
    // Fallback to a general error message
    errorMessage = error.message;
  }

  return errorMessage;
};
