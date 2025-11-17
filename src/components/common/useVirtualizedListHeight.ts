/**
 * Hook to calculate optimal list height based on container
 */
export function useVirtualizedListHeight(
  itemHeight: number,
  maxItems: number = 10,
  containerPadding: number = 0
): number {
  // Calculate height to show maxItems at once, plus padding
  return itemHeight * maxItems + containerPadding
}
