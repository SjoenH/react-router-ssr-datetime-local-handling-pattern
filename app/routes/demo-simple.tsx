// Simplified datetime-local + timezone demo
// Focus: Two scenarios - JavaScript ON vs OFF

import { Form } from "react-router";
import type { Route } from "./+types/demo-simple";
import { useEffect, useState } from "react";

// LOADER: Send UTC time from server
export async function loader() {
    const now = new Date();
    return {
        eventDate: now.toISOString(), // Always UTC
    };
}

// ACTION: Handle form submission
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const submittedValue = formData.get("event-time");
    const timezone = formData.get("timezone");

    if (!submittedValue || typeof submittedValue !== 'string') {
        throw new Error('Event time is required');
    }

    console.log(`📅 Form: "${submittedValue}" (timezone: ${timezone})`);

    // Handle different timezone scenarios
    let dateObject: Date;
    if (!timezone || timezone === 'Unknown (JavaScript required)') {
        // JS disabled with no manual selection: treat as UTC
        dateObject = new Date(submittedValue + 'Z');
        console.log(`⚠️  JS OFF (no selection) → UTC: ${dateObject.toISOString()}`);
    } else if (timezone === 'UTC') {
        // User manually selected UTC or JS detected UTC
        dateObject = new Date(submittedValue + 'Z');
        console.log(`🌍 Manual/Detected UTC → UTC: ${dateObject.toISOString()}`);
    } else {
        // JS enabled with timezone detection, or manual timezone selection
        dateObject = new Date(submittedValue);
        const timezoneStr = timezone.toString();
        const detectionMethod = timezoneStr.includes('/') ? 'Manual selection' : 'JS detection';
        console.log(`✅ ${detectionMethod} (${timezoneStr}) → Local: ${dateObject.toISOString()}`);
    }

    return null;
}

// COMPONENT: Simple UI focused on the core concept
export default function DemoSimple({ loaderData }: Route.ComponentProps) {
    const { eventDate } = loaderData;

    // State with hydration-safe defaults
    const [userTimezone, setUserTimezone] = useState<string>('Unknown (JavaScript required)');
    const [formattedForInput, setFormattedForInput] = useState<string>(eventDate.slice(0, 16));

    // Client-side: detect timezone and format for input
    useEffect(() => {
        const dateObject = new Date(eventDate);

        // Detect user timezone
        setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

        // Convert UTC to local time for datetime-local input
        const localTime = new Date(dateObject.getTime() - dateObject.getTimezoneOffset() * 60000);
        setFormattedForInput(localTime.toISOString().slice(0, 16));
    }, [eventDate]);

    return (
        <div className="max-w-3xl mx-auto p-8 font-sans">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
                📅 Simple datetime-local Demo
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
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">📊 Current Status</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">🌍 Your Browser</h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <strong>Timezone:</strong>
                                <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{userTimezone}</code>
                            </div>
                            <div>
                                <strong>Local time:</strong> {new Date(eventDate).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">🏗️ Server</h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <strong>UTC time:</strong>
                                <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{eventDate}</code>
                            </div>
                            <div>
                                <strong>Input value:</strong>
                                <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{formattedForInput}</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Form */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">📝 Try It</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Submit the form and check the console to see how the server interprets your input.
                </p>

                <Form method="post" className="space-y-4">
                    <div>
                        <label htmlFor="event-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📅 Event Time:
                        </label>
                        <input
                            type="datetime-local"
                            name="event-time"
                            id="event-time"
                            defaultValue={formattedForInput}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This input doesn't include timezone information
                        </p>
                    </div>

                    {/* Timezone selector when JavaScript is disabled */}
                    <noscript>
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-4">
                            <label htmlFor="timezone-select" className="block text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                                🌍 Your Timezone (JavaScript disabled):
                            </label>
                            <select
                                name="timezone"
                                id="timezone-select"
                                className="w-full p-2 border border-orange-300 dark:border-orange-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                defaultValue="UTC"
                            >
                                <option value="UTC">UTC (Coordinated Universal Time)</option>
                                <optgroup label="Americas">
                                    <option value="America/New_York">Eastern Time (New York)</option>
                                    <option value="America/Chicago">Central Time (Chicago)</option>
                                    <option value="America/Denver">Mountain Time (Denver)</option>
                                    <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                                    <option value="America/Toronto">Eastern Time (Toronto)</option>
                                    <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                                    <option value="America/Mexico_City">Central Time (Mexico City)</option>
                                    <option value="America/Sao_Paulo">Brasília Time (São Paulo)</option>
                                </optgroup>
                                <optgroup label="Europe">
                                    <option value="Europe/London">Greenwich Mean Time (London)</option>
                                    <option value="Europe/Berlin">Central European Time (Berlin)</option>
                                    <option value="Europe/Paris">Central European Time (Paris)</option>
                                    <option value="Europe/Rome">Central European Time (Rome)</option>
                                    <option value="Europe/Madrid">Central European Time (Madrid)</option>
                                    <option value="Europe/Amsterdam">Central European Time (Amsterdam)</option>
                                    <option value="Europe/Stockholm">Central European Time (Stockholm)</option>
                                    <option value="Europe/Oslo">Central European Time (Oslo)</option>
                                    <option value="Europe/Helsinki">Eastern European Time (Helsinki)</option>
                                    <option value="Europe/Moscow">Moscow Time</option>
                                </optgroup>
                                <optgroup label="Asia">
                                    <option value="Asia/Tokyo">Japan Standard Time (Tokyo)</option>
                                    <option value="Asia/Shanghai">China Standard Time (Shanghai)</option>
                                    <option value="Asia/Hong_Kong">Hong Kong Time</option>
                                    <option value="Asia/Singapore">Singapore Time</option>
                                    <option value="Asia/Seoul">Korea Standard Time (Seoul)</option>
                                    <option value="Asia/Mumbai">India Standard Time (Mumbai)</option>
                                    <option value="Asia/Dubai">Gulf Standard Time (Dubai)</option>
                                    <option value="Asia/Bangkok">Indochina Time (Bangkok)</option>
                                </optgroup>
                                <optgroup label="Australia & Pacific">
                                    <option value="Australia/Sydney">Australian Eastern Time (Sydney)</option>
                                    <option value="Australia/Melbourne">Australian Eastern Time (Melbourne)</option>
                                    <option value="Australia/Perth">Australian Western Time (Perth)</option>
                                    <option value="Pacific/Auckland">New Zealand Time (Auckland)</option>
                                </optgroup>
                                <optgroup label="Africa">
                                    <option value="Africa/Cairo">Eastern European Time (Cairo)</option>
                                    <option value="Africa/Johannesburg">South Africa Time</option>
                                    <option value="Africa/Lagos">West Africa Time (Lagos)</option>
                                </optgroup>
                            </select>
                            <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                                Since JavaScript is disabled, please manually select your timezone.
                                The server will use this to interpret your datetime input correctly.
                            </p>
                        </div>
                    </noscript>

                    {/* Hidden timezone field (only used when JavaScript is enabled) */}
                    <input
                        type="hidden"
                        name="timezone"
                        value={userTimezone}
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        📤 Submit & Check Console
                    </button>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>What gets sent:</strong>
                        <br />• event-time: [whatever you type]
                        <br />• timezone: {userTimezone}
                    </div>
                </Form>
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