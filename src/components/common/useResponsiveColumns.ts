/**
 * Hook to calculate responsive column count based on container width
 */
export function useResponsiveColumns(
  containerWidth: number,
  itemWidth: number,
  minColumns: number = 1,
  gap: number = 16
): number {
  const columns = Math.floor((containerWidth + gap) / (itemWidth + gap))
  return Math.max(minColumns, columns)
}
