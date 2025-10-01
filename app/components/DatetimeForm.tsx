import { Form } from "react-router";
import { TimezoneSelect } from "./TimezoneSelect";

interface DatetimeFormProps {
    /** Current datetime value for the input */
    inputValue: string;
    /** Current timezone (for hidden field when JS enabled) */
    timezone: string;
    /** Form submission method */
    method?: "get" | "post";
    /** Form action URL */
    action?: string;
    /** Additional CSS classes for the form */
    className?: string;
    /** Submit button text */
    submitText?: string;
    /** Whether to show debug info */
    showDebugInfo?: boolean;
}

/**
 * Reusable datetime form with timezone handling
 * Includes progressive enhancement with noscript fallback
 */
export function DatetimeForm({
    inputValue,
    timezone,
    method = "post",
    action,
    className = "space-y-4",
    submitText = "Submit",
    showDebugInfo = true
}: DatetimeFormProps) {
    return (
        <Form method={method} action={action} className={className}>
            {/* Datetime input */}
            <div>
                <label
                    htmlFor="event-time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    📅 Event Time:
                </label>
                <input
                    type="datetime-local"
                    name="event-time"
                    id="event-time"
                    defaultValue={inputValue}
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
                    <label
                        htmlFor="timezone-select"
                        className="block text-sm font-medium text-orange-800 dark:text-orange-200 mb-2"
                    >
                        🌍 Your Timezone (JavaScript disabled):
                    </label>
                    <TimezoneSelect />
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
                value={timezone}
            />

            {/* Submit button */}
            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
                📤 {submitText}
            </button>

            {/* Debug info */}
            {showDebugInfo && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>What gets sent:</strong>
                    <br />• event-time: [whatever you type]
                    <br />• timezone: {timezone}
                </div>
            )}
        </Form>
    );
}