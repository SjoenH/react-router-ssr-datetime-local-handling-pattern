import { TIMEZONE_OPTIONS } from "~/utils/timezone";

interface TimezoneSelectProps {
    name?: string;
    defaultValue?: string;
    className?: string;
    id?: string;
}

/**
 * Timezone selector component for manual timezone selection
 * Only visible when JavaScript is disabled (use with <noscript>)
 */
export function TimezoneSelect({
    name = "timezone",
    defaultValue = "UTC",
    className = "",
    id = "timezone-select"
}: TimezoneSelectProps) {
    // Group options by region
    const groupedOptions = TIMEZONE_OPTIONS.reduce((groups, option) => {
        const group = 'group' in option ? option.group : '';

        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(option);

        return groups;
    }, {} as Record<string, typeof TIMEZONE_OPTIONS[number][]>);

    const baseClassName = "w-full p-2 border border-orange-300 dark:border-orange-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";
    const finalClassName = className ? `${baseClassName} ${className}` : baseClassName;

    return (
        <select
            name={name}
            id={id}
            className={finalClassName}
            defaultValue={defaultValue}
        >
            {/* Ungrouped options first (UTC) */}
            {groupedOptions['']?.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}

            {/* Grouped options */}
            {Object.entries(groupedOptions).map(([groupName, options]) => {
                if (groupName === '') return null; // Skip ungrouped (already rendered)

                return (
                    <optgroup key={groupName} label={groupName}>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </optgroup>
                );
            })}
        </select>
    );
}