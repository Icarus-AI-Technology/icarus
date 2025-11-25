/**
 * ICARUS v5.0 - Microsoft 365 Integration
 * OAuth, Graph API client for Outlook, Teams, OneDrive, Calendar
 */

import { supabase } from '@/lib/supabase/client';
import { APIClient, APICache } from './api-client';
import type {
  MicrosoftConfig,
  MicrosoftToken,
  MicrosoftUser,
  MicrosoftEmail,
  MicrosoftCalendarEvent,
  MicrosoftTeamsMeeting,
  IntegrationHealth,
  APIError,
} from './types';

// Microsoft Graph API endpoints
const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';
const OAUTH_URL = 'https://login.microsoftonline.com';

// Scopes by feature
export const MICROSOFT_SCOPES = {
  email: ['Mail.Send', 'Mail.Read', 'Mail.ReadWrite'],
  calendar: ['Calendars.ReadWrite', 'Calendars.Read'],
  teams: ['OnlineMeetings.ReadWrite', 'OnlineMeetings.Read'],
  onedrive: ['Files.ReadWrite', 'Files.Read'],
  contacts: ['Contacts.Read', 'Contacts.ReadWrite'],
  user: ['User.Read', 'profile', 'email', 'openid'],
} as const;

// Configuration from environment
const getMicrosoftConfig = (): MicrosoftConfig => ({
  clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID ?? '',
  tenantId: import.meta.env.VITE_MICROSOFT_TENANT_ID,
  redirectUri: `${window.location.origin}/auth/microsoft/callback`,
  scopes: [...MICROSOFT_SCOPES.user, ...MICROSOFT_SCOPES.email],
});

export function isMicrosoftConfigured(): boolean {
  const config = getMicrosoftConfig();
  return Boolean(config.clientId);
}

/**
 * Microsoft 365 Client
 */
export class Microsoft365Client extends APIClient {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private userId: string | null = null;
  private cache: APICache;

  constructor() {
    super({ baseUrl: GRAPH_API_URL, timeout: 30000, retries: 3 });
    this.cache = new APICache(60000); // 1 minute cleanup
  }

  // =========================================================================
  // AUTHENTICATION
  // =========================================================================

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(scopes: string[], state?: string): string {
    const config = getMicrosoftConfig();
    const tenant = config.tenantId ?? 'common';
    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      scope: scopes.join(' '),
      response_mode: 'query',
      prompt: 'select_account',
      ...(state && { state }),
    });

    return `${OAUTH_URL}/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    scopes: string[]
  ): Promise<MicrosoftToken> {
    const config = getMicrosoftConfig();
    const tenant = config.tenantId ?? 'common';

    // This should be done server-side with client_secret
    // Using Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('microsoft365-auth', {
      body: {
        action: 'exchange_code',
        code,
        redirectUri: config.redirectUri,
        scopes,
      },
    });

    if (error) {
      throw new Error(`Token exchange failed: ${error.message}`);
    }

    const token: MicrosoftToken = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes,
      accountId: data.account_id ?? '',
    };

    await this.saveToken(token);
    this.setAccessToken(token.accessToken, token.expiresAt);

    return token;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<MicrosoftToken | null> {
    const storedToken = await this.getStoredToken();
    if (!storedToken?.refreshToken) {
      return null;
    }

    const { data, error } = await supabase.functions.invoke('microsoft365-auth', {
      body: {
        action: 'refresh_token',
        refreshToken: storedToken.refreshToken,
      },
    });

    if (error) {
      console.error('Token refresh failed:', error);
      return null;
    }

    const newToken: MicrosoftToken = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? storedToken.refreshToken,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: storedToken.scopes,
      accountId: storedToken.accountId,
    };

    await this.saveToken(newToken);
    this.setAccessToken(newToken.accessToken, newToken.expiresAt);

    return newToken;
  }

  /**
   * Set access token for API requests
   */
  setAccessToken(token: string, expiresAt: Date): void {
    this.accessToken = token;
    this.tokenExpiry = expiresAt;
  }

  /**
   * Ensure valid token is available
   */
  private async ensureValidToken(): Promise<void> {
    // Check if current token is still valid
    if (this.accessToken && this.tokenExpiry) {
      const buffer = 5 * 60 * 1000; // 5 minutes buffer
      if (this.tokenExpiry.getTime() > Date.now() + buffer) {
        return;
      }
    }

    // Try to refresh
    const newToken = await this.refreshAccessToken();
    if (!newToken) {
      throw new Error('No valid Microsoft 365 token available');
    }
  }

  /**
   * Make authenticated request to Graph API
   */
  private async graphRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.ensureValidToken();

    return this.request<T>(endpoint, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });
  }

  // =========================================================================
  // TOKEN STORAGE (Supabase with encryption)
  // =========================================================================

  private async saveToken(token: MicrosoftToken): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Store encrypted token via Edge Function
    await supabase.functions.invoke('microsoft365-auth', {
      body: {
        action: 'save_token',
        userId: userData.user.id,
        token,
      },
    });
  }

  private async getStoredToken(): Promise<MicrosoftToken | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase.functions.invoke('microsoft365-auth', {
      body: {
        action: 'get_token',
        userId: userData.user.id,
      },
    });

    if (error || !data) return null;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(data.expires_at),
      scopes: data.scopes ?? [],
      accountId: data.account_id ?? '',
    };
  }

  // =========================================================================
  // USER
  // =========================================================================

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<MicrosoftUser> {
    const cached = this.cache.get<MicrosoftUser>('me');
    if (cached) return cached;

    const data = await this.graphRequest<{
      id: string;
      displayName: string;
      mail: string;
      userPrincipalName: string;
      jobTitle?: string;
      department?: string;
    }>('/me');

    const user: MicrosoftUser = {
      id: data.id,
      displayName: data.displayName,
      email: data.mail ?? data.userPrincipalName,
      jobTitle: data.jobTitle,
      department: data.department,
    };

    this.cache.set('me', user, 300); // 5 min cache
    return user;
  }

  // =========================================================================
  // EMAIL (Outlook)
  // =========================================================================

  /**
   * Send email via Outlook
   */
  async sendEmail(email: MicrosoftEmail): Promise<{ success: boolean }> {
    const message = {
      subject: email.subject,
      body: {
        contentType: email.bodyType ?? 'HTML',
        content: email.body,
      },
      toRecipients: email.to.map((addr) => ({
        emailAddress: { address: addr },
      })),
      ccRecipients: email.cc?.map((addr) => ({
        emailAddress: { address: addr },
      })),
      bccRecipients: email.bcc?.map((addr) => ({
        emailAddress: { address: addr },
      })),
      importance: email.importance ?? 'normal',
      attachments: email.attachments?.map((a) => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: a.name,
        contentType: a.contentType,
        contentBytes: a.base64Content,
      })),
    };

    await this.graphRequest('/me/sendMail', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    return { success: true };
  }

  /**
   * Get recent emails
   */
  async getEmails(top = 10): Promise<Array<{
    id: string;
    subject: string;
    from: string;
    receivedDateTime: string;
    isRead: boolean;
    bodyPreview: string;
  }>> {
    const data = await this.graphRequest<{
      value: Array<{
        id: string;
        subject: string;
        from: { emailAddress: { address: string } };
        receivedDateTime: string;
        isRead: boolean;
        bodyPreview: string;
      }>;
    }>(`/me/messages?$top=${top}&$orderby=receivedDateTime DESC`);

    return data.value.map((msg) => ({
      id: msg.id,
      subject: msg.subject,
      from: msg.from.emailAddress.address,
      receivedDateTime: msg.receivedDateTime,
      isRead: msg.isRead,
      bodyPreview: msg.bodyPreview,
    }));
  }

  // =========================================================================
  // CALENDAR
  // =========================================================================

  /**
   * Create calendar event
   */
  async createCalendarEvent(
    event: MicrosoftCalendarEvent
  ): Promise<{ id: string; webLink: string }> {
    const eventPayload = {
      subject: event.subject,
      body: event.body ? { contentType: 'HTML', content: event.body } : undefined,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      location: event.location ? { displayName: event.location } : undefined,
      attendees: event.attendees?.map((email) => ({
        emailAddress: { address: email },
        type: 'required',
      })),
      isOnlineMeeting: event.isOnlineMeeting ?? false,
      onlineMeetingProvider: event.isOnlineMeeting ? 'teamsForBusiness' : undefined,
      reminderMinutesBeforeStart: event.reminderMinutes ?? 15,
    };

    const data = await this.graphRequest<{ id: string; webLink: string }>(
      '/me/events',
      {
        method: 'POST',
        body: JSON.stringify(eventPayload),
      }
    );

    return { id: data.id, webLink: data.webLink };
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(days = 7): Promise<Array<{
    id: string;
    subject: string;
    start: string;
    end: string;
    location?: string;
    isOnlineMeeting: boolean;
    onlineMeetingUrl?: string;
  }>> {
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const data = await this.graphRequest<{
      value: Array<{
        id: string;
        subject: string;
        start: { dateTime: string };
        end: { dateTime: string };
        location?: { displayName: string };
        isOnlineMeeting: boolean;
        onlineMeeting?: { joinUrl: string };
      }>;
    }>(`/me/calendarView?startDateTime=${startDate}&endDateTime=${endDate}&$orderby=start/dateTime`);

    return data.value.map((evt) => ({
      id: evt.id,
      subject: evt.subject,
      start: evt.start.dateTime,
      end: evt.end.dateTime,
      location: evt.location?.displayName,
      isOnlineMeeting: evt.isOnlineMeeting,
      onlineMeetingUrl: evt.onlineMeeting?.joinUrl,
    }));
  }

  // =========================================================================
  // TEAMS
  // =========================================================================

  /**
   * Create Teams meeting
   */
  async createTeamsMeeting(
    meeting: MicrosoftTeamsMeeting
  ): Promise<{ joinUrl: string; meetingId: string }> {
    const meetingPayload = {
      subject: meeting.subject,
      startDateTime: meeting.startDateTime.toISOString(),
      endDateTime: meeting.endDateTime.toISOString(),
      participants: {
        attendees: meeting.participants.map((email) => ({
          emailAddress: { address: email, name: email },
          type: 'required',
        })),
      },
    };

    const data = await this.graphRequest<{
      id: string;
      joinWebUrl: string;
    }>('/me/onlineMeetings', {
      method: 'POST',
      body: JSON.stringify(meetingPayload),
    });

    return { joinUrl: data.joinWebUrl, meetingId: data.id };
  }

  // =========================================================================
  // ONEDRIVE
  // =========================================================================

  /**
   * Upload file to OneDrive
   */
  async uploadFile(
    fileName: string,
    content: ArrayBuffer,
    folder = 'ICARUS'
  ): Promise<{ id: string; webUrl: string }> {
    // For small files (< 4MB)
    const path = `/me/drive/root:/${folder}/${fileName}:/content`;

    const data = await this.graphRequest<{ id: string; webUrl: string }>(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: content,
    });

    return { id: data.id, webUrl: data.webUrl };
  }

  /**
   * Get files from OneDrive folder
   */
  async getFiles(folder = 'ICARUS'): Promise<Array<{
    id: string;
    name: string;
    size: number;
    webUrl: string;
    lastModified: string;
  }>> {
    const data = await this.graphRequest<{
      value: Array<{
        id: string;
        name: string;
        size: number;
        webUrl: string;
        lastModifiedDateTime: string;
      }>;
    }>(`/me/drive/root:/${folder}:/children`);

    return data.value.map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      webUrl: file.webUrl,
      lastModified: file.lastModifiedDateTime,
    }));
  }

  // =========================================================================
  // HEALTH CHECK
  // =========================================================================

  /**
   * Check integration health
   */
  async checkHealth(): Promise<IntegrationHealth> {
    try {
      const token = await this.getStoredToken();

      if (!token) {
        return {
          name: 'Microsoft 365',
          status: 'disconnected',
        };
      }

      // Check token expiration
      const now = new Date();
      const expiresAt = new Date(token.expiresAt);
      const daysUntilExpiry = Math.floor(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (expiresAt < now) {
        // Try to refresh
        const refreshed = await this.refreshAccessToken();
        if (!refreshed) {
          return {
            name: 'Microsoft 365',
            status: 'error',
            errorMessage: 'Token expired and refresh failed',
          };
        }
      }

      // Verify token by making a simple API call
      await this.getCurrentUser();

      return {
        name: 'Microsoft 365',
        status: daysUntilExpiry < 7 ? 'expiring' : 'connected',
        lastSync: now,
        expiresAt,
        daysUntilExpiry,
      };
    } catch (error) {
      return {
        name: 'Microsoft 365',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Disconnect Microsoft 365
   */
  async disconnect(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.functions.invoke('microsoft365-auth', {
      body: {
        action: 'revoke_token',
        userId: userData.user.id,
      },
    });

    this.accessToken = null;
    this.tokenExpiry = null;
    this.cache.clear();
  }
}

// Singleton instance
export const microsoft365 = new Microsoft365Client();
