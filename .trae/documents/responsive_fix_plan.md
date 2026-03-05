# Responsive Fix Plan - Miner Orders Dashboard

## Problem Analysis
Despite previous attempts, the UI is still overflowing and cutting off content on mobile and tablet views.
Specific issues reported:
1.  **Static Data**: Ensure absolutely no static data remains in Order History.
2.  **Stats Cards**: Desktop card size is being used on mobile, causing overflow.
3.  **Order History (Tab View)**: Total Amount and Status columns are cutting off.
4.  **Sidebar**: Too wide on tablet view.
5.  **Tabs Navigation**: "New Requests", "Active Orders", "Order History" tabs are overflowing/cutting off on mobile.
6.  **Stats Row (Order History)**: Total Orders/Volume/Revenue/Last Transaction row is overflowing.

## Implementation Steps

### 1. Global Layout Fixes
-   **Main Container**: Ensure `max-w-full` and `overflow-x-hidden` are correctly applied to the root page container in `src/app/dashboard/orders/page.tsx`.
-   **Sidebar**: Further reduce sidebar width for tablet (`lg` breakpoint) or ensure it overlays if necessary.

### 2. Stats Cards (Overview)
-   **File**: `src/features/miner/orders/components/StatsCards.tsx`
-   **Fix**:
    -   Force 1 column on mobile (`grid-cols-1`).
    -   Force 2 columns on tablet (`md:grid-cols-2`).
    -   Reduce padding (`p-3` mobile vs `p-5` desktop).
    -   Reduce font sizes for titles and numbers on mobile.

### 3. Tabs Navigation
-   **File**: `src/app/dashboard/orders/page.tsx`
-   **Fix**:
    -   Ensure the tabs container has `overflow-x-auto` and `scrollbar-hide` (or styled scrollbar).
    -   Reduce tab padding and font size for mobile.

### 4. Order History View
-   **File**: `src/features/miner/orders/components/OrderHistoryView.tsx`
-   **Fix**:
    -   **Stats Row**: Switch from `grid` to a scrollable flex row or a tighter 2x2 grid on mobile to prevent overflow. Ensure text breaks/wraps.
    -   **Table/List**:
        -   Mobile: Use a simplified Card view. Ensure "Buyer" and "Amount" don't overlap or cut off (use `truncate` and `flex-shrink`).
        -   Tablet: Ensure the list view is used if the table is too wide, OR enable horizontal scrolling on the table wrapper specifically.
    -   **Static Data**: Verify removal of `historyData` constant and full usage of `items` prop.

### 5. Active Orders & New Requests
-   **Active Orders**: Ensure the mobile card view handles long numbers (e.g., Value) without breaking layout.
-   **New Requests**: Verify buttons stack vertically on mobile and text doesn't force container expansion.

## Verification Checklist
-   [ ] No horizontal scroll on the *page body* (only on specific elements like tabs/tables).
-   [ ] All 4 stats cards are fully visible and stacked on mobile.
-   [ ] Order History stats (Revenue/Volume) wrap or scale down, no cutoff.
-   [ ] Sidebar is narrower on tablet.
-   [ ] Dynamic API data is used everywhere.
