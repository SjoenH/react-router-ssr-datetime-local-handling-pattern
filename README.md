# datetime-local Timezone Demo

A comprehensive solution for handling timezone challenges with HTML's `datetime-local` input type, featuring progressive enhancement and reusable components.

## 🎯 The Problem

HTML's `datetime-local` input sends values like `"2025-10-01T20:30"` without timezone information. This creates a common web development challenge:

- **Client sends**: `"2025-10-01T20:30"` (no timezone context)
- **Server receives**: A string that could mean different things
- **Without proper handling**: Times get interpreted incorrectly, leading to data corruption

## ✨ The Solution

This project demonstrates a complete progressive enhancement approach:

- **🟢 JavaScript Enabled**: Automatic timezone detection using `Intl.DateTimeFormat().resolvedOptions().timeZone`
- **🟡 JavaScript Disabled**: Manual timezone selection with `<noscript>` fallback
- **🔴 Fallback**: Graceful UTC handling when no timezone info available

## 🚀 Live Demo

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to see the demo in action.

### Testing Both Scenarios

1. **With JavaScript**: Submit the form and check console for automatic timezone detection
2. **Without JavaScript**: Disable JS in browser, refresh page, see manual timezone selector

## 📦 Reusable Components

### Utilities (`app/utils/timezone.ts`)

```typescript
import { 
  detectUserTimezone, 
  utcToLocalInputFormat, 
  parseDatetimeWithTimezone 
} from '~/utils/timezone';

// Safe timezone detection
const timezone = detectUserTimezone();
// → "America/New_York" or "Unknown (JavaScript required)"

// Convert UTC to datetime-local format
const inputValue = utcToLocalInputFormat("2025-10-01T20:30:00.000Z");
// → "2025-10-01T16:30" (adjusted for local timezone)

// Parse form input with timezone context
const result = parseDatetimeWithTimezone("2025-10-01T20:30", "America/New_York");
// → { date: Date, method: 'js-detection', timezone: 'America/New_York' }
```

### React Hook (`app/hooks/useTimezoneDetection.ts`)

```typescript
import { useTimezoneDetection } from '~/hooks/useTimezoneDetection';

function MyComponent({ utcDateString }) {
  const {
    timezone,           // "America/New_York"
    timezoneDisplay,    // "Eastern Time (America/New_York)"
    localTimeString,    // "10/1/2025, 4:30:00 PM"
    inputValue,         // "2025-10-01T16:30"
    isDetected          // true after client-side detection
  } = useTimezoneDetection({ utcDateString });
  
  return <div>Your timezone: {timezone}</div>;
}
```

### Complete Form Component (`app/components/DatetimeForm.tsx`)

```typescript
import { DatetimeForm } from '~/components/DatetimeForm';

function MyPage({ timezone, inputValue }) {
  return (
    <DatetimeForm
      inputValue={inputValue}
      timezone={timezone}
      submitText="Schedule Event"
      showDebugInfo={false}
    />
  );
}
```

### Timezone Selector (`app/components/TimezoneSelect.tsx`)

```typescript
import { TimezoneSelect } from '~/components/TimezoneSelect';

// Use with <noscript> for progressive enhancement
<noscript>
  <TimezoneSelect name="timezone" defaultValue="UTC" />
</noscript>
```

### Status Display (`app/components/TimezoneStatus.tsx`)

```typescript
import { TimezoneStatus } from '~/components/TimezoneStatus';

<TimezoneStatus
  timezone="America/New_York"
  timezoneDisplay="Eastern Time (America/New_York)"
  localTimeString="10/1/2025, 4:30:00 PM"
  utcDateString="2025-10-01T20:30:00.000Z"
  inputValue="2025-10-01T16:30"
  isDetected={true}
/>
```

## � Server-Side Implementation

### React Router Action Example

```typescript
import { parseDatetimeWithTimezone } from '~/utils/timezone';

export async function action({ request }) {
  const formData = await request.formData();
  const submittedValue = formData.get("event-time");
  const timezone = formData.get("timezone");

  // Parse with timezone context
  const result = parseDatetimeWithTimezone(submittedValue, timezone?.toString());
  
  // result.date is now properly interpreted
  // result.method tells you detection method
  // result.timezone shows which timezone was used
  
  // Always store UTC in database
  await saveEvent(result.date.toISOString());
  
  return null;
}
```

### Next.js API Route Example

```typescript
// api/events/route.ts
import { parseDatetimeWithTimezone } from './utils/timezone';

export async function POST(request: Request) {
  const data = await request.formData();
  const datetime = data.get('event-time') as string;
  const timezone = data.get('timezone') as string;
  
  const result = parseDatetimeWithTimezone(datetime, timezone);
  
  // Store UTC date
  await db.events.create({
    scheduledAt: result.date.toISOString()
  });
  
  return Response.json({ success: true });
}
```

## 🌍 Supported Timezones

The project includes 35+ major world timezones organized by region:

- **Americas**: New York, Chicago, Denver, Los Angeles, Toronto, Vancouver, São Paulo...
- **Europe**: London, Berlin, Paris, Stockholm, Oslo, Moscow...
- **Asia**: Tokyo, Shanghai, Mumbai, Dubai, Singapore...
- **Australia & Pacific**: Sydney, Melbourne, Auckland...
- **Africa**: Cairo, Johannesburg, Lagos...

## 🎨 Framework Integration

### React Router (Current Implementation)

```typescript
// Loader: Send UTC from server
export async function loader() {
  return { eventDate: new Date().toISOString() };
}

// Action: Handle form submission
export async function action({ request }) {
  // Use parseDatetimeWithTimezone utility
}

// Component: Use useTimezoneDetection hook
export default function EventPage({ loaderData }) {
  const timezoneInfo = useTimezoneDetection(loaderData);
  return <DatetimeForm {...timezoneInfo} />;
}
```

### Next.js

```typescript
// app/events/page.tsx
'use client';

import { useTimezoneDetection } from './hooks/useTimezoneDetection';
import { DatetimeForm } from './components/DatetimeForm';

export default function EventsPage() {
  const utcDate = new Date().toISOString();
  const timezoneInfo = useTimezoneDetection({ utcDateString: utcDate });
  
  return <DatetimeForm {...timezoneInfo} />;
}
```

### SvelteKit

```typescript
// src/routes/events/+page.svelte
<script>
  import { detectUserTimezone, utcToLocalInputFormat } from '$lib/utils/timezone';
  import { onMount } from 'svelte';
  
  let timezone = 'Unknown (JavaScript required)';
  let inputValue = '';
  
  onMount(() => {
    timezone = detectUserTimezone();
    inputValue = utcToLocalInputFormat(data.eventDate);
  });
</script>

<form method="post">
  <input type="datetime-local" name="event-time" bind:value={inputValue} />
  <input type="hidden" name="timezone" value={timezone} />
  
  <noscript>
    <!-- Include manual timezone selector -->
  </noscript>
  
  <button type="submit">Submit</button>
</form>
```

## 🧪 Testing Strategy

### Manual Testing

1. **JavaScript Enabled**:
   - Submit form
   - Check console for `✅ JS detection (America/New_York) → Local: ...`

2. **JavaScript Disabled**:
   - Disable JavaScript in browser
   - Refresh page
   - See timezone selector appear
   - Select timezone and submit
   - Check console for `✅ Manual selection (Europe/London) → Local: ...`

3. **Edge Cases**:
   - Test with UTC timezone
   - Test with unusual timezones
   - Test form submission without timezone

### Automated Testing

```typescript
// Example test with your testing framework
describe('timezone utilities', () => {
  test('parseDatetimeWithTimezone handles all scenarios', () => {
    // JS disabled
    const result1 = parseDatetimeWithTimezone('2025-10-01T20:30', null);
    expect(result1.method).toBe('utc-fallback');
    
    // Manual selection
    const result2 = parseDatetimeWithTimezone('2025-10-01T20:30', 'America/New_York');
    expect(result2.method).toBe('manual-selection');
    
    // JS detection
    const result3 = parseDatetimeWithTimezone('2025-10-01T20:30', 'America/New_York');
    expect(result3.method).toBe('js-detection');
  });
});
```

## 🎓 Educational Content

This project serves as a complete educational resource:

- **📖 Problem explanation**: Why datetime-local is challenging
- **🔧 Multiple solutions**: 5+ different approaches to solve it
- **💻 Working code**: Production-ready implementation
- **📋 Best practices**: Progressive enhancement, testing, pitfalls
- **🎯 Framework guidance**: React Router, Next.js, SvelteKit examples

See `.copilot-instructions.md` for comprehensive implementation guidance.

## 🏗️ Built With

- **React Router v7**: Full-stack React framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tooling

## 🚀 Deployment

### Development

```bash
npm install
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t datetime-local-demo .
docker run -p 3000:3000 datetime-local-demo
```

## 🤝 Contributing

This project demonstrates best practices for datetime-local timezone handling. Contributions welcome for:

- Additional timezone options
- Framework-specific examples
- Testing improvements
- Documentation enhancements

## 📄 License

MIT License - feel free to use this code in your projects!

## 🔗 Related Resources

- [MDN datetime-local documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local)
- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [Intl.DateTimeFormat documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)

---

**🎯 Perfect for developers who need to implement datetime-local timezone handling in production applications!**
