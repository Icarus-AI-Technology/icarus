# Frontend Changes Required for E2E Test Stability

This document outlines the frontend component changes needed to support the new robust E2E tests located in `tests/e2e/`.

## Overview

The new E2E tests use semantic selectors (`data-testid` attributes) instead of fragile CSS selectors to improve test stability and reduce flakiness. This document provides guidance on where to add these attributes in your React components.

## Required data-testid Attributes

### 1. Core Layout Components

#### App Shell / Main Container
**File to modify:** `src/components/layout/IcarusLayout.tsx` or `src/App.tsx`

Add `data-testid="app-shell"` to the main application container:

```tsx
// Example in IcarusLayout.tsx
export function IcarusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen" data-testid="app-shell">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

#### Global Loading Spinner (if exists)
**File to modify:** Location of your global spinner component

Add `data-testid="global-spinner"` to your loading spinner:

```tsx
// Example
export function GlobalSpinner() {
  const { isLoading } = useGlobalLoadingState();
  
  if (!isLoading) return null;
  
  return (
    <div className="spinner-overlay" data-testid="global-spinner">
      <Spinner />
    </div>
  );
}
```

### 2. Login Page Components

**File to modify:** `src/app/(public)/login/page.tsx` or similar login component

Add the following data-testid attributes to your login form:

```tsx
export function LoginPage() {
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="username"
        data-testid="login-username"
        placeholder="Email"
      />
      
      <input
        type="password"
        name="password"
        data-testid="login-password"
        placeholder="Password"
      />
      
      <button type="submit" data-testid="login-submit">
        Login
      </button>
    </form>
  );
}
```

### 3. Dashboard Components

#### Dashboard Heading
**File to modify:** Main dashboard component (e.g., `src/components/modules/Dashboard.tsx`)

Add `data-testid="dashboard-heading"` to the main dashboard title:

```tsx
export function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 data-testid="dashboard-heading">Dashboard</h1>
      
      {/* Dashboard content */}
    </div>
  );
}
```

#### Cards/KPI List Container
Add `data-testid="cards-list"` to the container that holds your dashboard cards:

```tsx
export function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 data-testid="dashboard-heading">Dashboard</h1>
      
      <div className="grid gap-4" data-testid="cards-list">
        {kpis.map(kpi => (
          <Card key={kpi.id} data-testid="card-item">
            {/* Card content */}
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### Individual Card Items
Add `data-testid="card-item"` to each card/KPI component:

```tsx
export function KPICard({ kpi }: { kpi: KPI }) {
  return (
    <Card data-testid="card-item" onClick={handleClick}>
      <h3>{kpi.title}</h3>
      <p>{kpi.value}</p>
    </Card>
  );
}
```

#### Card Details Panel
Add `data-testid="card-details-panel"` to the panel/modal that shows when clicking a card:

```tsx
export function CardDetailsPanel({ isOpen, card }: Props) {
  if (!isOpen) return null;
  
  return (
    <div className="details-panel" data-testid="card-details-panel">
      <h2>Details</h2>
      {/* Panel content */}
    </div>
  );
}
```

## Implementation Checklist

Use this checklist to track implementation:

- [ ] `app-shell` - Main application container (IcarusLayout or App)
- [ ] `global-spinner` - Global loading spinner (if exists)
- [ ] `login-username` - Username/email input field
- [ ] `login-password` - Password input field
- [ ] `login-submit` - Login submit button
- [ ] `dashboard-heading` - Main dashboard heading/title
- [ ] `cards-list` - Container for dashboard cards/KPIs
- [ ] `card-item` - Individual card/KPI elements
- [ ] `card-details-panel` - Details panel that opens when clicking a card

## Testing Your Changes

After adding the data-testid attributes, you can test them by:

1. **Inspect Elements:** Use browser DevTools to verify the attributes are present
2. **Run E2E Tests:** Execute the new tests:
   ```bash
   npm run test:e2e
   ```
3. **Use Playwright Inspector:** Debug tests interactively:
   ```bash
   npx playwright test --debug
   ```

## Best Practices

1. **Naming Convention:** Use lowercase with hyphens (kebab-case) for data-testid values
2. **Unique IDs:** Ensure each data-testid is unique within its scope
3. **Semantic Names:** Use descriptive names that indicate the element's purpose
4. **Stability:** Don't change data-testid values once established, as tests depend on them
5. **Documentation:** Document any new data-testid attributes added beyond this list

## Benefits of This Approach

- **Reduced Flakiness:** Tests won't break when CSS classes or structure changes
- **Better Semantics:** Clear intent about which elements are test targets
- **Faster Execution:** Direct selectors are faster than complex CSS queries
- **Easier Debugging:** Clear identification of test elements in the DOM

## Questions or Issues?

If you have questions about where to add these attributes or encounter issues:
1. Check the new test files in `tests/e2e/` for usage examples
2. Review the helper functions in `tests/e2e/utils.ts`
3. Consult the E2E test README at `tests/e2e/README.md`

## Related Files

- E2E Tests: `tests/e2e/login.spec.ts`, `tests/e2e/dashboard.spec.ts`
- Test Utilities: `tests/e2e/utils.ts`
- Test Config: `tests/e2e/playwright.config.ts`, `playwright.config.ts`
- Test Documentation: `tests/e2e/README.md`
