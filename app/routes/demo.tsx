// datetime-local + timezone demo - Progressive Enhancement Implementation
// Shows timezone handling with JS detection (automatic) and noscript fallback (manual selection)

import type { Route } from "./+types/demo";
import { useTimezoneDetection } from "~/hooks/useTimezoneDetection";
import { parseDatetimeWithTimezone } from "~/utils/timezone";
import { DatetimeForm } from "~/components/DatetimeForm";
import { TimezoneStatus } from "~/components/TimezoneStatus";

// LOADER: Send UTC time from server
export async function loader() {
    const now = new Date();
    return {
        eventDate: now.toISOString(), // Always UTC
    };
}

// ACTION: Handle form submission using utility functions
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const submittedValue = formData.get("event-time");
    const timezone = formData.get("timezone");

    if (!submittedValue || typeof submittedValue !== 'string') {
        throw new Error('Event time is required');
    }

    console.log(`📅 Form: "${submittedValue}" (timezone: ${timezone})`);

    // Use utility function to parse datetime with timezone context
    const result = parseDatetimeWithTimezone(submittedValue, timezone?.toString());

    // Log the result with method and timezone info
    const methodEmojis = {
        'utc-fallback': '⚠️',
        'utc-explicit': '🌍',
        'js-detection': '✅',
        'manual-selection': '✅'
    };

    const methodNames = {
        'utc-fallback': 'JS OFF (no selection)',
        'utc-explicit': 'Manual/Detected UTC',
        'js-detection': 'JS detection',
        'manual-selection': 'Manual selection'
    };

    console.log(
        `${methodEmojis[result.method]} ${methodNames[result.method]} (${result.timezone}) → ${result.date.toISOString()}`
    );

    return null;
}

// COMPONENT: Progressive enhancement UI with timezone handling
export default function Demo({ loaderData }: Route.ComponentProps) {
    const { eventDate } = loaderData;

    // Use timezone detection hook for all timezone-related logic
    const timezoneInfo = useTimezoneDetection({ utcDateString: eventDate });

    return (
        <div className="max-w-3xl mx-auto p-8 font-sans">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
                📅 datetime-local + Timezone Demo
            </h1>

            {/* Core Problem Explanation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
                    🎯 The Problem
                </h2>
                <p className="text-blue-800 dark:text-blue-200 mb-4">
                    HTML's <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">datetime-local</code> input
                    sends "2025-10-01T20:30" but doesn't say what timezone that is!
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded">
                        <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ JavaScript Enabled</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            We detect your timezone and send it with the form.
                            Server interprets the time correctly.
                        </p>
                    </div>
                    <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded">
                        <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2">⚠️ JavaScript Disabled</h3>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                            Shows timezone selector for manual selection.
                            Server uses selected timezone or assumes UTC if none selected.
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Status */}
            <TimezoneStatus
                timezone={timezoneInfo.timezone}
                timezoneDisplay={timezoneInfo.timezoneDisplay}
                localTimeString={timezoneInfo.localTimeString}
                utcDateString={eventDate}
                inputValue={timezoneInfo.inputValue}
                isDetected={timezoneInfo.isDetected}
            />

            {/* The Form */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">📝 Try It</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Submit the form and check the console to see how the server interprets your input.
                </p>

                <DatetimeForm
                    inputValue={timezoneInfo.inputValue}
                    timezone={timezoneInfo.timezone}
                    submitText="Submit & Check Console"
                />
            </div>

            {/* Test Instructions */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold mb-4 text-yellow-900 dark:text-yellow-100">🧪 Test Both Scenarios</h3>
                <div className="space-y-3 text-sm">
                    <div>
                        <strong className="text-yellow-800 dark:text-yellow-200">JavaScript Enabled (current):</strong>
                        <p className="text-yellow-700 dark:text-yellow-300">
                            Submit the form and check console. Should see "✅ JS detection → Local: ..."
                        </p>
                    </div>
                    <div>
                        <strong className="text-yellow-800 dark:text-yellow-200">JavaScript Disabled test:</strong>
                        <p className="text-yellow-700 dark:text-yellow-300">
                            Disable JavaScript in browser settings, refresh page. You'll see a timezone selector.
                            Select your timezone and submit. Should see "✅ Manual selection → Local: ..." in console.
                        </p>
                    </div>
                </div>
            </div>

            {/* Solutions Section */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold mb-4 text-green-900 dark:text-green-100">🔧 How We Overcome This Issue</h3>

                <div className="space-y-6">
                    {/* Current Solution */}
                    <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ Our Current Solution</h4>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                            <div className="space-y-2 text-sm">
                                <div><strong>1. Detect timezone with JavaScript:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Intl.DateTimeFormat().resolvedOptions().timeZone</code></div>
                                <div><strong>2. Fallback timezone selector:</strong> Show manual selection when JavaScript disabled using <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">&lt;noscript&gt;</code></div>
                                <div><strong>3. Send timezone with form:</strong> Hidden field (JS) or visible selector (no JS)</div>
                                <div><strong>4. Server handles all cases:</strong> JS detection, manual selection, or UTC fallback</div>
                                <div><strong>5. Hydration-safe rendering:</strong> Use useState + useEffect to avoid SSR mismatches</div>
                            </div>
                        </div>
                    </div>

                    {/* Alternative Solutions */}
                    <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🔄 Alternative Approaches</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                                <h5 className="font-medium mb-2">🍪 Cookie Approach</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Set timezone in cookie on first visit</p>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                    <strong>Pros:</strong> Works server-side<br />
                                    <strong>Cons:</strong> Cookie management, first-visit issue
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                                <h5 className="font-medium mb-2">🌍 IP Geolocation</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Estimate timezone from user's IP address</p>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                    <strong>Pros:</strong> Works without JS<br />
                                    <strong>Cons:</strong> Inaccurate with VPNs, privacy concerns
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                                <h5 className="font-medium mb-2">🔗 URL Parameter</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pass timezone as query parameter</p>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                    <strong>Pros:</strong> Simple, cacheable<br />
                                    <strong>Cons:</strong> Requires user interaction, ugly URLs
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                                <h5 className="font-medium mb-2">📝 User Selection</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Let user manually select their timezone</p>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                    <strong>Pros:</strong> 100% accurate, works everywhere<br />
                                    <strong>Cons:</strong> Extra UX step, user burden
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Code Example */}
                    <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">💻 Key Code Pattern</h4>
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded border">
                            <pre className="text-sm overflow-x-auto">
                                <code className="text-gray-800 dark:text-gray-200">
                                    {`// Server action: Handle both JS enabled/disabled
if (!timezone || timezone === 'Unknown (JavaScript required)') {
  // JS disabled: treat input as UTC
  dateObject = new Date(submittedValue + 'Z');
} else {
  // JS enabled: treat as local time from user's timezone  
  dateObject = new Date(submittedValue);
}`}
                                </code>
                            </pre>
                        </div>
                    </div>

                    {/* Best Practices */}
                    <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🎯 Best Practices</h4>
                        <ul className="text-sm space-y-1 text-green-700 dark:text-green-300 list-disc list-inside">
                            <li><strong>Always store UTC in database:</strong> Convert all times to UTC for consistency</li>
                            <li><strong>Progressive enhancement:</strong> Ensure basic functionality works without JavaScript</li>
                            <li><strong>Graceful fallbacks:</strong> Have a clear fallback strategy (UTC assumption)</li>
                            <li><strong>Clear user communication:</strong> Explain what timezone will be used</li>
                            <li><strong>Test both scenarios:</strong> Always test with and without JavaScript</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}