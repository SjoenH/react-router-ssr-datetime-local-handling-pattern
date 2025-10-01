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

## � npm Package Roadmap

### Market Analysis

Based on extensive npm ecosystem research (October 2025), **no existing packages solve the `datetime-local` timezone interpretation problem with progressive enhancement**. This represents a significant opportunity.

**Existing packages** are either:

- General timezone libraries (`moment-timezone`, `@js-joda/timezone`) - no datetime-local focus
- Basic React components (`react-timezone-select`) - no progressive enhancement
- Incomplete solutions (`datetime-local-polyfill`) - no timezone handling

**Our unique value proposition**:

- ✅ Framework-agnostic core utilities
- ✅ Progressive enhancement (works without JavaScript)
- ✅ Production-ready TypeScript implementation
- ✅ Comprehensive timezone support
- ✅ Hydration-safe React components

### Package Structure Plan

#### 1. `@datetime-local/core` (Priority #1)

**Zero dependencies, framework-agnostic utilities**

```typescript
// Most valuable package - solves universal problem
export {
  detectUserTimezone,           // Safe timezone detection
  parseDatetimeWithTimezone,    // Core parsing logic
  utcToLocalInputFormat,        // UTC to local conversion
  formatTimezoneDisplay,        // User-friendly display
  TIMEZONE_OPTIONS,             // 35+ supported timezones
  type TimezoneResult,          // TypeScript types
  type TimezoneParseMethod
} from './timezone';
```

**Target audience**: All web frameworks using datetime-local
**Installation**: `npm install @datetime-local/core`

#### 2. `@datetime-local/react` (Priority #2)

**React-specific components and hooks**

```typescript
// React ecosystem integration
export {
  // Components
  TimezoneSelect,               // Progressive timezone selector
  DatetimeForm,                 // Complete form component
  TimezoneStatus,               // Timezone display component
  
  // Hooks
  useTimezoneDetection,         // Hydration-safe detection
  
  // Types
  type TimezoneDetectionResult,
  type DatetimeFormProps
} from './index';
```

**Dependencies**: `react`, `@datetime-local/core`
**Target audience**: React developers
**Installation**: `npm install @datetime-local/react`

#### 3. `@datetime-local/server` (Priority #3)

**Server-side utilities and patterns**

```typescript
// Server framework helpers
export {
  // React Router
  createTimezoneAction,         // Standard action handler
  createTimezoneLoader,         // SSR-safe loader
  
  // Next.js
  handleTimezoneSubmission,     // API route helper
  
  // Express/Fastify
  timezoneMiddleware,           // Request parsing middleware
  
  // Validation
  validateTimezoneSubmission,   // Input validation
  sanitizeTimezoneInput        // Security helpers
} from './index';
```

**Dependencies**: `@datetime-local/core`
**Target audience**: Full-stack developers
**Installation**: `npm install @datetime-local/server`

### Implementation Timeline

#### Phase 1: Core Package (Weeks 1-2)

- [ ] Extract utilities from `app/utils/timezone.ts`
- [ ] Create comprehensive test suite
- [ ] Add JSDoc documentation
- [ ] Set up TypeScript build process
- [ ] Create minimal README with examples
- [ ] Publish `@datetime-local/core@1.0.0`

#### Phase 2: React Package (Weeks 3-4)

- [ ] Extract components from `app/components/`
- [ ] Extract hooks from `app/hooks/`
- [ ] Create Storybook documentation
- [ ] Add React testing library tests
- [ ] Ensure SSR compatibility
- [ ] Publish `@datetime-local/react@1.0.0`

#### Phase 3: Server Package (Weeks 5-6)

- [ ] Create framework-specific helpers
- [ ] Add validation and security utilities
- [ ] Write integration examples
- [ ] Test with multiple frameworks
- [ ] Publish `@datetime-local/server@1.0.0`

#### Phase 4: Documentation & Marketing (Weeks 7-8)

- [ ] Create comprehensive documentation site
- [ ] Write blog posts about the problem/solution
- [ ] Submit to awesome lists and newsletters
- [ ] Engage with React/web dev communities
- [ ] Gather feedback and iterate

### Package Configuration

#### Monorepo Structure

```
packages/
├── core/                     # @datetime-local/core
│   ├── src/
│   │   ├── timezone.ts      # Main utilities
│   │   ├── types.ts         # TypeScript definitions
│   │   └── index.ts         # Public API
│   ├── tests/               # Jest tests
│   ├── package.json
│   └── README.md
├── react/                   # @datetime-local/react
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # React hooks
│   │   └── index.ts
│   ├── stories/             # Storybook
│   ├── tests/
│   └── package.json
└── server/                  # @datetime-local/server
    ├── src/
    │   ├── react-router/    # React Router helpers
    │   ├── nextjs/          # Next.js helpers
    │   ├── express/         # Express helpers
    │   └── index.ts
    └── package.json
```

#### Build Configuration

- **TypeScript**: ES2020 target, strict mode
- **Build tool**: Rollup for multiple formats (ESM, CJS, UMD)
- **Testing**: Jest + React Testing Library
- **Documentation**: TypeDoc + custom examples
- **CI/CD**: GitHub Actions for automated testing/publishing

### Success Metrics

#### Technical Goals

- [ ] 95%+ test coverage across all packages
- [ ] Tree-shakeable builds (ESM support)
- [ ] TypeScript-first development
- [ ] Zero runtime dependencies for core package
- [ ] SSR compatibility for React package

#### Adoption Goals

- [ ] 1,000+ weekly downloads within 6 months
- [ ] Documentation site with 5+ framework examples
- [ ] Community contributions and feedback
- [ ] Recognition in React/timezone development communities

### Migration Path

For this demo project:

1. **Phase 1**: Refactor to use `@datetime-local/core`
2. **Phase 2**: Update to use `@datetime-local/react`
3. **Phase 3**: Add server utilities from `@datetime-local/server`
4. **Documentation**: Update README with package examples

This creates a feedback loop where our demo becomes a real-world test case for the packages.

## �🔗 Related Resources

- [MDN datetime-local documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local)
- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [Intl.DateTimeFormat documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)

---

**🎯 Perfect for developers who need to implement datetime-local timezone handling in production applications!**
