/**
 * Utility functions for handling datetime-local timezone challenges
 */

/**
 * Detect user's timezone using the Intl API
 * @returns Timezone string (e.g., "America/New_York") or fallback
 */
export function detectUserTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
        return 'Unknown (JavaScript required)';
    }
}

/**
 * Convert UTC datetime to local datetime-local input format
 * @param utcDateString - UTC ISO string (e.g., "2025-10-01T20:30:00.000Z")
 * @returns Local datetime string for input (e.g., "2025-10-01T16:30")
 */
export function utcToLocalInputFormat(utcDateString: string): string {
    const dateObject = new Date(utcDateString);

    // Convert to local time by adjusting for timezone offset
    const localTime = new Date(dateObject.getTime() - dateObject.getTimezoneOffset() * 60000);

    // Return in YYYY-MM-DDTHH:mm format for datetime-local input
    return localTime.toISOString().slice(0, 16);
}

/**
 * Parse datetime-local input with timezone context
 * @param datetimeValue - Value from datetime-local input (e.g., "2025-10-01T20:30")
 * @param timezone - User's timezone or "Unknown (JavaScript required)"
 * @returns Object with parsed Date and metadata
 */
export function parseDatetimeWithTimezone(
    datetimeValue: string,
    timezone: string | null | undefined
): {
    date: Date;
    method: 'utc-fallback' | 'utc-explicit' | 'js-detection' | 'manual-selection';
    timezone: string;
} {
    const timezoneStr = timezone?.toString() || 'Unknown (JavaScript required)';

    if (!timezone || timezone === 'Unknown (JavaScript required)') {
        // JS disabled with no manual selection: treat as UTC
        return {
            date: new Date(datetimeValue + 'Z'),
            method: 'utc-fallback',
            timezone: 'UTC (fallback)'
        };
    }

    if (timezone === 'UTC') {
        // User explicitly selected UTC or JS detected UTC
        return {
            date: new Date(datetimeValue + 'Z'),
            method: 'utc-explicit',
            timezone: 'UTC'
        };
    }

    // Determine if this was manual selection or JS detection
    const isManualSelection = timezoneStr.includes('/');

    return {
        date: new Date(datetimeValue),
        method: isManualSelection ? 'manual-selection' : 'js-detection',
        timezone: timezoneStr
    };
}

/**
 * Get display-friendly timezone name
 * @param timezone - Timezone string
 * @returns Human-readable timezone name
 */
export function getTimezoneDisplayName(timezone: string): string {
    if (timezone === 'Unknown (JavaScript required)') {
        return 'Unknown (JavaScript required)';
    }

    if (timezone === 'UTC') {
        return 'UTC (Coordinated Universal Time)';
    }

    // For IANA timezone names, try to get a friendly display name
    try {
        const date = new Date();
        const formatter = new Intl.DateTimeFormat('en', {
            timeZone: timezone,
            timeZoneName: 'long'
        });

        const parts = formatter.formatToParts(date);
        const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;

        if (timeZoneName) {
            return `${timeZoneName} (${timezone})`;
        }
    } catch {
        // Fallback if Intl formatting fails
    }

    return timezone;
}

/**
 * Common timezone options for manual selection
 */
export const TIMEZONE_OPTIONS = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },

    // Americas
    { group: 'Americas', value: 'America/New_York', label: 'Eastern Time (New York)' },
    { group: 'Americas', value: 'America/Chicago', label: 'Central Time (Chicago)' },
    { group: 'Americas', value: 'America/Denver', label: 'Mountain Time (Denver)' },
    { group: 'Americas', value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
    { group: 'Americas', value: 'America/Toronto', label: 'Eastern Time (Toronto)' },
    { group: 'Americas', value: 'America/Vancouver', label: 'Pacific Time (Vancouver)' },
    { group: 'Americas', value: 'America/Mexico_City', label: 'Central Time (Mexico City)' },
    { group: 'Americas', value: 'America/Sao_Paulo', label: 'Brasília Time (São Paulo)' },

    // Europe
    { group: 'Europe', value: 'Europe/London', label: 'Greenwich Mean Time (London)' },
    { group: 'Europe', value: 'Europe/Berlin', label: 'Central European Time (Berlin)' },
    { group: 'Europe', value: 'Europe/Paris', label: 'Central European Time (Paris)' },
    { group: 'Europe', value: 'Europe/Rome', label: 'Central European Time (Rome)' },
    { group: 'Europe', value: 'Europe/Madrid', label: 'Central European Time (Madrid)' },
    { group: 'Europe', value: 'Europe/Amsterdam', label: 'Central European Time (Amsterdam)' },
    { group: 'Europe', value: 'Europe/Stockholm', label: 'Central European Time (Stockholm)' },
    { group: 'Europe', value: 'Europe/Oslo', label: 'Central European Time (Oslo)' },
    { group: 'Europe', value: 'Europe/Helsinki', label: 'Eastern European Time (Helsinki)' },
    { group: 'Europe', value: 'Europe/Moscow', label: 'Moscow Time' },

    // Asia
    { group: 'Asia', value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)' },
    { group: 'Asia', value: 'Asia/Shanghai', label: 'China Standard Time (Shanghai)' },
    { group: 'Asia', value: 'Asia/Hong_Kong', label: 'Hong Kong Time' },
    { group: 'Asia', value: 'Asia/Singapore', label: 'Singapore Time' },
    { group: 'Asia', value: 'Asia/Seoul', label: 'Korea Standard Time (Seoul)' },
    { group: 'Asia', value: 'Asia/Mumbai', label: 'India Standard Time (Mumbai)' },
    { group: 'Asia', value: 'Asia/Dubai', label: 'Gulf Standard Time (Dubai)' },
    { group: 'Asia', value: 'Asia/Bangkok', label: 'Indochina Time (Bangkok)' },

    // Australia & Pacific
    { group: 'Australia & Pacific', value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)' },
    { group: 'Australia & Pacific', value: 'Australia/Melbourne', label: 'Australian Eastern Time (Melbourne)' },
    { group: 'Australia & Pacific', value: 'Australia/Perth', label: 'Australian Western Time (Perth)' },
    { group: 'Australia & Pacific', value: 'Pacific/Auckland', label: 'New Zealand Time (Auckland)' },

    // Africa
    { group: 'Africa', value: 'Africa/Cairo', label: 'Eastern European Time (Cairo)' },
    { group: 'Africa', value: 'Africa/Johannesburg', label: 'South Africa Time' },
    { group: 'Africa', value: 'Africa/Lagos', label: 'West Africa Time (Lagos)' },
] as const;