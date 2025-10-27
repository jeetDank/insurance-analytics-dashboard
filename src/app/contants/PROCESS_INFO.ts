// Processing Messages Constants
// Human-friendly generic messages for user experience during API calls

export const PROCESSING_MESSAGES = {
  // Initial Query Phase
  QUERY: {
    SEARCHING: "Looking for companies that match your search...",
    FOUND_RESULTS: "Found companies for you!",
    NO_RESULTS: "Hmm, we couldn't find any companies matching that. Try a different search?",
    ERROR: "Oops! Something went wrong while searching. Let's try that again.",
  },

  // Company Details Phase
  COMPANY: {
    FETCHING: "Getting company details...",
    LOADING: "Loading company information...",
    SUCCESS: "Got the company details!",
    ERROR: "Couldn't load company information. Moving to the next one...",
  },

  // Analysis Phase
  ANALYSE: {
    PREPARING: "Preparing to analyze the data...",
    ANALYZING: "Analyzing company performance...",
    CRUNCHING_NUMBERS: "Crunching the numbers...",
    CALCULATING_METRICS: "Calculating key metrics...",
    ALMOST_DONE: "Almost there! Finalizing the analysis...",
    SUCCESS: "Analysis complete!",
    ERROR: "We couldn't complete the analysis right now. Moving on...",
  },

  // Overall Progress
  PROGRESS: {
    STARTING: "Getting everything ready for you...",
    WORKING: "Working on it...",
    PROCESSING: "Processing companies...",
    FINALIZING: "Putting the finishing touches on your results...",
    COMPLETE: "All done! Here's what we found:",
    PARTIAL_COMPLETE: "Done! We got results for most companies.",
  },

  // General Status Messages
  STATUS: {
    PLEASE_WAIT: "This might take a moment...",
    THANK_YOU: "Thanks for your patience!",
    RETRYING: "Let's try that one more time...",
    TIMEOUT: "This is taking longer than expected. Still working on it...",
  },

  // Error Recovery
  ERROR: {
    PARTIAL_SUCCESS: "We got some results, but ran into issues with a few companies.",
    RETRY_AVAILABLE: "Want to try again?",
    CONTACT_SUPPORT: "If this keeps happening, please reach out to our support team.",
    GENERAL: "Something unexpected happened. We're looking into it.",
  },
} as const;