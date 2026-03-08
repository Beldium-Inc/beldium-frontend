export const ORDER_STATUS = {
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PAID: 'paid',
  UNPAID: 'unpaid',
} as const;

export const LOGISTICS_STATUS = {
  TRANSIT: 'transit',
  DELIVERED: 'delivered',
  LOCKED: 'LOCKED',
} as const;
