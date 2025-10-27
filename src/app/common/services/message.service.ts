import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PROCESSING_MESSAGES } from '../../contants/PROCESS_INFO';

/**
 * Message Interface
 */
export interface ProcessingMessage {
  text: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: string;
}

/**
 * ProcessingMessageService
 * An Angular service to manage and broadcast processing messages using BehaviorSubject
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageSubject = new BehaviorSubject<ProcessingMessage | null>(null);
  private messageHistory: ProcessingMessage[] = [];
  private readonly maxHistorySize = 50;

  /**
   * Observable for components to subscribe to
   */
  public message$: Observable<ProcessingMessage | null> = this.messageSubject.asObservable();

  constructor() {}

  /**
   * Set a new message and notify all subscribers
   */
  setMessage(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    const newMessage: ProcessingMessage = {
      text: message,
      type: type,
      timestamp: new Date().toISOString(),
    };

    // Add to history
    this.messageHistory.push(newMessage);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }

    // Emit new message
    this.messageSubject.next(newMessage);
  }

  /**
   * Clear the current message
   */
  clearMessage(): void {
    this.messageSubject.next(null);
  }

  /**
   * Get the current message value
   */
  getCurrentMessage(): ProcessingMessage | null {
    return this.messageSubject.value;
  }

  /**
   * Get message history
   */
  getHistory(): ProcessingMessage[] {
    return [...this.messageHistory];
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.messageHistory = [];
  }

  /**
   * Query messages
   */
  query = {
    searching: (): void => this.setMessage(PROCESSING_MESSAGES.QUERY.SEARCHING, 'info'),
    foundResults: (): void => this.setMessage(PROCESSING_MESSAGES.QUERY.FOUND_RESULTS, 'success'),
    noResults: (): void => this.setMessage(PROCESSING_MESSAGES.QUERY.NO_RESULTS, 'warning'),
    error: (): void => this.setMessage(PROCESSING_MESSAGES.QUERY.ERROR, 'error'),
  };

  /**
   * Company messages
   */
  company = {
    fetching: (): void => this.setMessage(PROCESSING_MESSAGES.COMPANY.FETCHING, 'info'),
    loading: (): void => this.setMessage(PROCESSING_MESSAGES.COMPANY.LOADING, 'info'),
    success: (): void => this.setMessage(PROCESSING_MESSAGES.COMPANY.SUCCESS, 'success'),
    error: (): void => this.setMessage(PROCESSING_MESSAGES.COMPANY.ERROR, 'error'),
  };

  /**
   * Analysis messages
   */
  analyse = {
    preparing: (): void => this.setMessage(PROCESSING_MESSAGES.ANALYSE.PREPARING, 'info'),
    analyzing: (): void => this.setMessage(PROCESSING_MESSAGES.ANALYSE.ANALYZING, 'info'),
    crunchingNumbers: (): void => this.setMessage(PROCESSING_MESSAGES.ANALYSE.CRUNCHING_NUMBERS, 'info'),
    calculatingMetrics: (): void => this.setMessage(PROCESSING_MESSAGES.ANALYSE.CALCULATING_METRICS, 'info'),
    almostDone: (): void => this.setMessage(PROCESSING_MESSAGES.ANALYSE.ALMOST_DONE, 'info'),
    success: (): void => this.setMessage(PROCESSING_MESSAGES.ANALYSE.SUCCESS, 'success'),
    error: (): void => this.setMessage(PROCESSING_MESSAGES.ANALYSE.ERROR, 'error'),
  };

  /**
   * Progress messages
   */
  progress = {
    starting: (): void => this.setMessage(PROCESSING_MESSAGES.PROGRESS.STARTING, 'info'),
    working: (): void => this.setMessage(PROCESSING_MESSAGES.PROGRESS.WORKING, 'info'),
    processing: (): void => this.setMessage(PROCESSING_MESSAGES.PROGRESS.PROCESSING, 'info'),
    finalizing: (): void => this.setMessage(PROCESSING_MESSAGES.PROGRESS.FINALIZING, 'info'),
    complete: (): void => this.setMessage(PROCESSING_MESSAGES.PROGRESS.COMPLETE, 'success'),
    partialComplete: (): void => this.setMessage(PROCESSING_MESSAGES.PROGRESS.PARTIAL_COMPLETE, 'warning'),
  };

  /**
   * Status messages
   */
  status = {
    pleaseWait: (): void => this.setMessage(PROCESSING_MESSAGES.STATUS.PLEASE_WAIT, 'info'),
    thankYou: (): void => this.setMessage(PROCESSING_MESSAGES.STATUS.THANK_YOU, 'success'),
    retrying: (): void => this.setMessage(PROCESSING_MESSAGES.STATUS.RETRYING, 'warning'),
    timeout: (): void => this.setMessage(PROCESSING_MESSAGES.STATUS.TIMEOUT, 'warning'),
  };

  /**
   * Error messages
   */
  error = {
    partialSuccess: (): void => this.setMessage(PROCESSING_MESSAGES.ERROR.PARTIAL_SUCCESS, 'warning'),
    retryAvailable: (): void => this.setMessage(PROCESSING_MESSAGES.ERROR.RETRY_AVAILABLE, 'info'),
    contactSupport: (): void => this.setMessage(PROCESSING_MESSAGES.ERROR.CONTACT_SUPPORT, 'error'),
    general: (): void => this.setMessage(PROCESSING_MESSAGES.ERROR.GENERAL, 'error'),
  };
}