
// 1. LOADER: Runs on the "server" or before// It receives the form data and processes it.
export async function action({ request }: Route.ActionArgs) {
    // TODO: Fix UTC parsing bug when JavaScript is disabled
    // When timezone is 'Unknown (JavaScript required)', append 'Z' to treat input as UTC
    console.log("\n📤 Action: Receiving form submission...");e page loads.
// SUMMARY: Always work with UTC dates from the server/database.
// Send UTC ISO strings to the client for consistency.

import { Form, useLoaderData } from "react-router";
import type { Route } from "./+types/demo";
import { useEffect, useState } from "react";

// It fetches data and provides it to the component.
export async function loader({ request }: Route.LoaderArgs) {
    console.log("🏗️ Loader: Getting current time...");

    // Check what headers are available from the request
    const acceptLanguage = request.headers.get('accept-language');
    const userAgent = request.headers.get('user-agent');
    const cookies = request.headers.get('cookie');

    console.log("🏗️ Loader: Available request info:");
    console.log("  Accept-Language:", acceptLanguage);
    console.log("  User-Agent:", userAgent);
    console.log("  Cookies:", cookies);

    // Create a new date object.
    const now = new Date();

    // Get the date in UTC ISO format (e.g., "2025-10-01T17:30:55.123Z")
    const utcDateString = now.toISOString();

    console.log(`🏗️ Loader: Sending UTC date string to component: ${utcDateString}`);

    // The loader returns the data for the component to use.
    return {
        eventDate: utcDateString,
        requestInfo: {
            acceptLanguage,
            userAgent: userAgent?.substring(0, 100) + '...' // Truncate for display
        }
    };
}

// 2. ACTION: Runs on the "server" when a form is submitted to it.
// SUMMARY: Receive local time string + timezone from client.
// Convert the local time back to UTC using the timezone info for storage.

// It receives the form data and processes it.
export async function action({ request }: Route.ActionArgs) {
    console.log("\n� Action: Receiving form submission...");

    const formData = await request.formData();
    const submittedValue = formData.get("event-time"); // 'name' attribute of the input
    const timezone = formData.get("timezone"); // Get the timezone from the hidden input

    if (!submittedValue || typeof submittedValue !== 'string') {
        throw new Error('Event time is required');
    }

    console.log(`� Action: Received a timezone-less string from form: ${submittedValue}`);
    console.log(`� Action: User's timezone: ${timezone}`);

    // When you create a new Date from this string, JavaScript in the server/browser
    // environment will interpret it based on its own local timezone.
    const dateObject = new Date(submittedValue);

    console.log(`� Action: Converted to a Date object:`, dateObject);
    console.log(`...and its UTC string is: ${dateObject.toISOString()}`);
    console.log(""); // Add spacing after action logs

    // In a real app, you would save this to a database.
    // We'll return null for this example.
    return null;
}

// 3. COMPONENT: The React component that renders the UI.
// SUMMARY: Convert UTC date from server to local time for display and form input.
// Capture user's timezone to send back with the form submission.

export default function EventPage({ loaderData }: Route.ComponentProps) {
    // Get the data provided by the loader.
    const { eventDate, requestInfo } = loaderData;

    // State for client-side values to avoid hydration mismatch
    // Use server-side fallbacks to reduce flicker
    const [localTimeString, setLocalTimeString] = useState<string>(new Date(eventDate).toLocaleString());
    const [userTimezone, setUserTimezone] = useState<string>('UTC (server-side)');
    const [formattedForInput, setFormattedForInput] = useState<string>(eventDate.slice(0, 16)); // Start with UTC format

    // Calculate client-side values after hydration to get accurate timezone info
    useEffect(() => {
        const dateObject = new Date(eventDate);

        // Set local time string for display
        setLocalTimeString(dateObject.toLocaleString());

        // Set user timezone
        setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

        // Format for datetime-local input (convert UTC to local time)
        const formatted = new Date(dateObject.getTime() - dateObject.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        setFormattedForInput(formatted);
    }, [eventDate]);

    return (
        <div className="max-w-4xl mx-auto p-8 font-sans">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Event Scheduler 🗓️</h1>

            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">� Date Handling Strategy Summary</h3>
                <div className="space-y-3">
                    <div className="text-gray-800 dark:text-gray-200">
                        <strong>1. 🏗️ LOADER (Server):</strong> Always work with UTC dates. Send UTC ISO strings to client.
                    </div>
                    <div className="text-gray-800 dark:text-gray-200">
                        <strong>2. 🖥️ COMPONENT (View):</strong> Convert UTC to local time for display. Capture timezone for submission.
                    </div>
                    <div className="text-gray-800 dark:text-gray-200">
                        <strong>3. 📤 ACTION (Server):</strong> Receive local time + timezone. Convert back to UTC for storage.
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">🌐 Server-Side Request Information</h3>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-gray-100">
                            📍 What's Available from HTTP Request:
                        </h4>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
                            <div className="mb-2">
                                <strong>Accept-Language:</strong>
                                <code className="ml-2 text-blue-600 dark:text-blue-400">
                                    {requestInfo.acceptLanguage || 'Not available'}
                                </code>
                            </div>
                            <div>
                                <strong>User-Agent:</strong>
                                <code className="ml-2 text-blue-600 dark:text-blue-400">
                                    {requestInfo.userAgent || 'Not available'}
                                </code>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>⚠️ Limitation:</strong> HTTP requests don't include timezone information!
                            Accept-Language gives us locale (en-US, nb-NO) but not timezone.
                            A country like the US has multiple timezones.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-gray-100">
                            🔧 Possible Solutions:
                        </h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                            <li><strong>Cookie approach:</strong> Set timezone in cookie on first visit, read server-side later</li>
                            <li><strong>IP geolocation:</strong> Estimate timezone from IP (inaccurate with VPNs)</li>
                            <li><strong>Two-pass rendering:</strong> Our current approach with useEffect</li>
                            <li><strong>URL parameter:</strong> Pass timezone as a query parameter</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">💻 Code Examples</h3>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-gray-100 flex items-center">
                            🏗️ 1. Loader (Server-side)
                        </h4>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                            <code className="text-gray-800 dark:text-gray-200">
                                <span className="text-purple-600 dark:text-purple-400">export</span>{" "}
                                <span className="text-purple-600 dark:text-purple-400">async</span>{" "}
                                <span className="text-purple-600 dark:text-purple-400">function</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">loader</span>({"{"} <span className="text-blue-600 dark:text-blue-400">request</span> {"}"}) {"{"}
                                <br />
                                {"  "}<span className="text-gray-500 dark:text-gray-400">// Check available request headers</span>
                                <br />
                                {"  "}<span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">acceptLanguage</span> = request.headers.<span className="text-blue-600 dark:text-blue-400">get</span>(<span className="text-green-600 dark:text-green-400">'accept-language'</span>);
                                <br />
                                <br />
                                {"  "}<span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">now</span> = <span className="text-purple-600 dark:text-purple-400">new</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">Date</span>();
                                <br />
                                {"  "}<span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">utcDateString</span> = now.<span className="text-blue-600 dark:text-blue-400">toISOString</span>();
                                <br />
                                <br />
                                {"  "}<span className="text-purple-600 dark:text-purple-400">return</span> {"{"} <span className="text-blue-600 dark:text-blue-400">eventDate</span>: utcDateString, <span className="text-blue-600 dark:text-blue-400">requestInfo</span>: {"{"} acceptLanguage {"}"} {"}"};
                                <br />
                                {"}"}
                            </code>
                        </pre>
                    </div>

                    <div>
                        <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-gray-100 flex items-center">
                            🖥️ 2. Component (Client-side)
                        </h4>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                            <code className="text-gray-800 dark:text-gray-200">
                                <span className="text-gray-500 dark:text-gray-400">// Use server fallbacks to reduce flicker, update with client values</span>
                                <br />
                                <span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                                [<span className="text-blue-600 dark:text-blue-400">formattedForInput</span>, <span className="text-blue-600 dark:text-blue-400">setFormattedForInput</span>] = <span className="text-blue-600 dark:text-blue-400">useState</span>(
                                <br />
                                {"  "}eventDate.<span className="text-blue-600 dark:text-blue-400">slice</span>(<span className="text-orange-600 dark:text-orange-400">0</span>, <span className="text-orange-600 dark:text-orange-400">16</span>) <span className="text-gray-500 dark:text-gray-400">// Start with UTC format</span>
                                <br />
                                );
                                <br />
                                <br />
                                <span className="text-blue-600 dark:text-blue-400">useEffect</span>(() =&gt; {"{"}
                                <br />
                                {"  "}<span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">dateObject</span> = <span className="text-purple-600 dark:text-purple-400">new</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">Date</span>(eventDate);
                                <br />
                                {"  "}<span className="text-gray-500 dark:text-gray-400">// Convert to actual local time after hydration</span>
                                <br />
                                {"  "}<span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">formatted</span> = <span className="text-purple-600 dark:text-purple-400">new</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">Date</span>(
                                <br />
                                {"    "}dateObject.<span className="text-blue-600 dark:text-blue-400">getTime</span>() - dateObject.<span className="text-blue-600 dark:text-blue-400">getTimezoneOffset</span>() * <span className="text-orange-600 dark:text-orange-400">60000</span>
                                <br />
                                {"  "}).<span className="text-blue-600 dark:text-blue-400">toISOString</span>().<span className="text-blue-600 dark:text-blue-400">slice</span>(<span className="text-orange-600 dark:text-orange-400">0</span>, <span className="text-orange-600 dark:text-orange-400">16</span>);
                                <br />
                                {"  "}<span className="text-blue-600 dark:text-blue-400">setFormattedForInput</span>(formatted);
                                <br />
                                {"}"}, [eventDate]);
                                <br />
                                <br />
                                <span className="text-gray-500 dark:text-gray-400">// Controlled input with proper onChange</span>
                                <br />
                                <span className="text-red-600 dark:text-red-400">&lt;input</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">value</span>={"{"}formattedForInput{"}"}
                                <br />
                                {"       "}<span className="text-blue-600 dark:text-blue-400">onChange</span>={"{"}{`(e) => setFormattedForInput(e.target.value)`}{"}"} <span className="text-red-600 dark:text-red-400">/&gt;</span>
                            </code>
                        </pre>
                    </div>

                    <div>
                        <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-gray-100 flex items-center">
                            📤 3. Action (Server-side)
                        </h4>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                            <code className="text-gray-800 dark:text-gray-200">
                                <span className="text-purple-600 dark:text-purple-400">export</span>{" "}
                                <span className="text-purple-600 dark:text-purple-400">async</span>{" "}
                                <span className="text-purple-600 dark:text-purple-400">function</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">action</span>({"{"} <span className="text-blue-600 dark:text-blue-400">request</span> {"}"}) {"{"}
                                <br />
                                {"  "}<span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">formData</span> = <span className="text-purple-600 dark:text-purple-400">await</span>{" "}
                                request.<span className="text-blue-600 dark:text-blue-400">formData</span>();
                                <br />
                                {"  "}<span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">submittedValue</span> = formData.<span className="text-blue-600 dark:text-blue-400">get</span>(<span className="text-green-600 dark:text-green-400">"event-time"</span>);
                                <br />
                                {"  "}<span className="text-gray-500 dark:text-gray-400">// Receives: <span className="text-green-600 dark:text-green-400">"2025-10-01T21:33"</span> (local time string)</span>
                                <br />
                                <br />
                                {"  "}<span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">timezone</span> = formData.<span className="text-blue-600 dark:text-blue-400">get</span>(<span className="text-green-600 dark:text-green-400">"timezone"</span>);
                                <br />
                                {"  "}<span className="text-gray-500 dark:text-gray-400">// Receives: <span className="text-green-600 dark:text-green-400">"Europe/Oslo"</span></span>
                                <br />
                                <br />
                                {"  "}<span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">dateObject</span> = <span className="text-purple-600 dark:text-purple-400">new</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">Date</span>(submittedValue);
                                <br />
                                {"  "}<span className="text-purple-600 dark:text-purple-400">const</span>{" "}
                                <span className="text-blue-600 dark:text-blue-400">utcString</span> = dateObject.<span className="text-blue-600 dark:text-blue-400">toISOString</span>();
                                <br />
                                {"  "}<span className="text-gray-500 dark:text-gray-400">// Converts back to: <span className="text-green-600 dark:text-green-400">"2025-10-01T19:33:00.000Z"</span> (UTC)</span>
                                <br />
                                <br />
                                {"  "}<span className="text-gray-500 dark:text-gray-400">// Save utcString to database</span>
                                <br />
                                {"}"}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        The loader provided this <strong className="text-gray-900 dark:text-gray-100">UTC date string</strong>:
                        <br />
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono mt-1 inline-block">{eventDate}</code>
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        In your local timezone ({userTimezone || 'Loading...'}), that's:
                        <br />
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono mt-1 inline-block">
                            {localTimeString || 'Loading...'}
                        </code>
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        For the input, we convert it to local time format (without timezone info):
                        <br />
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono mt-1 inline-block">
                            {formattedForInput || 'Loading...'}
                        </code>
                    </p>
                </div>
            </div>

            <hr className="border-gray-300 dark:border-gray-600 mb-8" />

            {/* The Form component from React Router handles the submission. */}
            {/* It will automatically call the `action` function for this route. */}
            <Form method="post" className="space-y-6">
                <div>
                    <label htmlFor="event-time" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Select Event Time:
                    </label>

                    <input
                        type="datetime-local"
                        id="event-time"
                        name="event-time" // This name is used to retrieve the value in the action
                        value={formattedForInput} // Controlled input
                        onChange={(e) => setFormattedForInput(e.target.value)} // Handle user changes
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    />

                    {/* Hidden input to capture the user's timezone */}
                    <input
                        type="hidden"
                        name="timezone"
                        value={userTimezone}
                    />

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                        The datetime-local input is timezone-agnostic. It shows local time
                        and submits that same local time string. We capture timezone separately to convert back to UTC on the server.
                    </p>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                    Submit to Action
                </button>
            </Form>
        </div>
    );
}