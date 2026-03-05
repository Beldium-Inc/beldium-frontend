# Implementation Plan - Miner Orders Dashboard

## Goal
Implement the **Orders** section in the miner portal (`/dashboard/orders`) to track and manage buyer transactions.

## UI Structure
Based on the Figma screenshots, the page has:
1.  **Header**: "Orders" title + subtitle "Track and manage buyer transactions."
2.  **Summary Cards** (4 cards):
    - **New Request(s)** (Blue): Count + "Awaiting review"
    - **Active orders** (White): Count + "In progress"
    - **Require Action** (Orange): Count + "Compliance or logistics needed"
    - **Completed** (Green): Count + "Successfully fulfilled"
3.  **Tabs Navigation**:
    - **New Requests** (Badge count)
    - **Active Orders** (Badge count)
    - **Order History**
4.  **Tab Content**:
    - **New Requests**: List of RFQs cards (Buyer name, Order ID, Mineral, Quantity, Price, Timeline, Location, Logistics) with "Decline" and "Review request" buttons.
    - **Active Orders**: Table with columns (Order ID, Total Value, Quantity, Payment Status, Logistics Status, Action).
    - **Order History**: Summary stats row (Total Orders, Volume, Revenue, Last Transaction) + Table with filters (Status, Payment, Date Range) and columns (Order ID, Buyer, Quantity, Delivered Date, Payment Date, Total Amount, Status).

## Data Integration
### Endpoints
1.  **Overview Stats**: `GET /miner/dashboard/overview/`
    - Response: `{ incoming_rfqs, active_orders, compliance_pending, completed_orders }`
    - Map to cards:
        - `incoming_rfqs` -> New Request(s)
        - `active_orders` -> Active orders
        - `compliance_pending` -> Require Action
        - `completed_orders` -> Completed

2.  **New Requests**: `GET /miner/dashboard/new_requests/`
    - Response: List of requests (buyer, mineral, qty, price, etc.)
    - Pagination support (`page`, `per_page`)

3.  **Active Orders**: `GET /miner/dashboard/active_orders/`
    - Response: List of active orders (order_code, value, status, etc.)
    - Pagination support

4.  **Order History**: Static mock data for now (as requested).

## Implementation Steps

### 1. API Setup
-   Update `src/features/miner/dashboard/api.ts`:
    -   Add `getOrdersOverview`
    -   Add `getActiveOrders`
    -   (Note: `getOpenQueue` already exists, maybe alias or reuse for "New Requests")
    -   Define types for `OrdersOverviewResponse`, `ActiveOrdersResponse`, `ActiveOrderItem`.

### 2. Components
-   Create `src/features/miner/orders/` directory.
-   **StatsCards**: Component for the 4 summary cards.
-   **NewRequestsList**: Component for the "New Requests" tab (Card layout).
-   **ActiveOrdersTable**: Component for the "Active Orders" tab (Table layout).
-   **OrderHistoryView**: Component for "Order History" tab (Stats row + Table with filters).

### 3. Page Assembly
-   Create `src/app/dashboard/orders/page.tsx`.
-   Implement the tabs state (`activeTab`).
-   Fetch data using `useQuery` for each section.
-   Render corresponding components based on active tab.

### 4. Styling & Polish
-   Match Figma colors (Blue/Orange/Green backgrounds for cards).
-   Ensure responsive design (stack cards on mobile, scrollable tables).
-   Add loading skeletons.

## Verification
-   Check against Figma screenshots.
-   Verify API data mapping.
-   Test tab switching.
