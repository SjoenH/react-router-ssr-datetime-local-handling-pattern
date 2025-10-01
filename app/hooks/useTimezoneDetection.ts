import { useEffect, useState } from "react";
import { detectUserTimezone, utcToLocalInputFormat, getTimezoneDisplayName } from "~/utils/timezone";

interface UseTimezoneDetectionOptions {
    utcDateString: string;
    fallbackTimezone?: string;
}

interface TimezoneDetectionResult {
    /** Current detected or fallback timezone */
    timezone: string;
    /** Human-readable timezone display name */
    timezoneDisplay: string;
    /** Local time string for display */
    localTimeString: string;
    /** Formatted datetime string for datetime-local input */
    inputValue: string;
    /** Whether timezone detection is complete */
    isDetected: boolean;
}

/**
 * Hook for timezone detection and datetime formatting
 * Handles hydration-safe timezone detection and UTC conversion
 */
export function useTimezoneDetection({
    utcDateString,
    fallbackTimezone = 'Unknown (JavaScript required)'
}: UseTimezoneDetectionOptions): TimezoneDetectionResult {
    // Start with hydration-safe defaults
    const [timezone, setTimezone] = useState<string>(fallbackTimezone);
    const [isDetected, setIsDetected] = useState(false);

    // Client-side timezone detection
    useEffect(() => {
        const detectedTimezone = detectUserTimezone();
        setTimezone(detectedTimezone);
        setIsDetected(true);
    }, []);

    // Calculate derived values
    const dateObject = new Date(utcDateString);
    const localTimeString = dateObject.toLocaleString();
    const timezoneDisplay = getTimezoneDisplayName(timezone);

    // Format for datetime-local input
    const inputValue = isDetected
        ? utcToLocalInputFormat(utcDateString)
        : utcDateString.slice(0, 16); // Fallback to UTC format

    return {
        timezone,
        timezoneDisplay,
        localTimeString,
        inputValue,
        isDetected
    };
}