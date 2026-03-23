# UI Coding Standards

## Component Library

**ONLY shadcn/ui components are permitted in this project.**

- Do NOT create custom UI components.
- Do NOT use any other component library (MUI, Chakra, Radix directly, etc.).
- All UI must be composed exclusively from shadcn/ui components available in `src/components/ui/`.
- If a shadcn/ui component does not yet exist in the project, add it via the CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```

## Date Formatting

All dates must be formatted using **date-fns**. No other date formatting approach is permitted.

### Required Format

Dates must be displayed with an ordinal day, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

Use `format` from `date-fns` with a custom ordinal helper:

```ts
import { format } from "date-fns";

function formatDate(date: Date): string {
  const day = date.getDate();
  const ordinal =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  return `${day}${ordinal} ${format(date, "MMM yyyy")}`;
}
```

Example usage:

```ts
formatDate(new Date("2025-09-01")); // "1st Sep 2025"
formatDate(new Date("2025-08-02")); // "2nd Aug 2025"
formatDate(new Date("2026-01-03")); // "3rd Jan 2026"
formatDate(new Date("2024-06-04")); // "4th Jun 2024"
```

> Place this helper in a shared utility file (e.g., `src/lib/format-date.ts`) and import it wherever dates are displayed.
