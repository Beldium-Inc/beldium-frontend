# Tablet Optimization Plan for Miner Dashboard

The goal is to refine the responsiveness of the Miner Dashboard specifically for tablet views (e.g., iPad, Nest Hub), ensuring elements fit comfortably without horizontal scrolling or awkward wrapping.

## 1. Overview Cards Layout
**Current Issue:** On medium screens (tablet), `grid-cols-3` might be too cramped, causing content to overflow or wrap poorly.
**Fix:**
- Adjust grid breakpoints:
  - Mobile: `grid-cols-1` (unchanged)
  - Tablet (md): `grid-cols-2` (new intermediate step)
  - Desktop (xl): `grid-cols-3` (shift 3-column layout to larger screens)
- Ensure card content (e.g., "Account Health" rows) has sufficient padding and font scaling.

## 2. "Create Listing" Banner
**Current Issue:** The text and button might fight for space on narrower tablet widths.
**Fix:**
- Review the flex behavior at `md` breakpoint.
- Ensure text wraps gracefully and the button doesn't shrink or overflow.
- Consider stacking vertically on smaller tablets (`md`) and going horizontal only on `lg` or `xl`.

## 3. Open Queue Table
**Current Issue:** The desktop table view might be too wide for portrait tablet mode, triggering horizontal scroll.
**Fix:**
- Evaluate switching to the "List View" (card style) for tablets as well (`hidden lg:block` -> `hidden xl:block`), OR
- Refine table column widths and visibility for `md` screens (e.g., hide less critical columns like "Date" on tablets).
- For this plan, extending the List View to tablets (`md`) is likely the cleaner UX choice.

## 4. Header & Sidebar Interaction
**Current Issue:** The sidebar might take up too much space on tablets, squeezing the main content.
**Fix:**
- Ensure the sidebar behaves correctly (collapsible or overlay) on tablet sizes.
- Verify `md` breakpoint padding in `page.tsx` (`px-4` or similar) to maximize usable space.

## Implementation Steps

1.  **Modify `OverviewCards.tsx`**:
    - Change grid class from `md:grid-cols-3` to `md:grid-cols-2 xl:grid-cols-3`.

2.  **Modify `OpenQueueTable.tsx`**:
    - Update visibility classes:
      - List View: `block xl:hidden` (show on mobile AND tablet/desktop up to xl)
      - Table View: `hidden xl:block` (show table only on extra large screens)

3.  **Modify `page.tsx` (Dashboard Main)**:
    - Adjust banner layout classes: `flex-col lg:flex-row` instead of `md:flex-row`.
    - Fine-tune padding: `px-4 md:px-6`.

4.  **Verify**:
    - Check "Nest Hub" (1024x600) and iPad dimensions.
