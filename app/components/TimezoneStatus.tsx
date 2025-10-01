interface TimezoneStatusProps {
    /** Current timezone string */
    timezone: string;
    /** Human-readable timezone display name */
    timezoneDisplay: string;
    /** Local time string for display */
    localTimeString: string;
    /** UTC datetime string from server */
    utcDateString: string;
    /** Formatted input value */
    inputValue: string;
    /** Whether timezone detection is complete */
    isDetected?: boolean;
}

/**
 * Status display component showing current timezone and datetime information
 */
export function TimezoneStatus({
    timezone,
    timezoneDisplay,
    localTimeString,
    utcDateString,
    inputValue,
    isDetected = true
}: TimezoneStatusProps) {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                📊 Current Status
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                        🌍 Your Browser
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div>
                            <strong>Timezone:</strong>
                            <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {timezone}
                            </code>
                            {!isDetected && (
                                <span className="ml-2 text-orange-600 dark:text-orange-400 text-xs">
                                    (detecting...)
                                </span>
                            )}
                        </div>
                        <div>
                            <strong>Display:</strong> {timezoneDisplay}
                        </div>
                        <div>
                            <strong>Local time:</strong> {localTimeString}
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                        🏗️ Server
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div>
                            <strong>UTC time:</strong>
                            <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {utcDateString}
                            </code>
                        </div>
                        <div>
                            <strong>Input value:</strong>
                            <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {inputValue}
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}