/**
 * Virtualized Grid Component
 *
 * Efficiently renders large grids by only rendering visible items.
 * Uses react-window for virtualization with grid layout.
 */

import { FixedSizeGrid as Grid } from 'react-window'
import { ReactNode, CSSProperties } from 'react'

export interface VirtualizedGridProps<T> {
  /** Array of items to render */
  items: T[]
  /** Width of each column in pixels */
  columnWidth: number
  /** Height of each row in pixels */
  rowHeight: number
  /** Total height of the grid container in pixels */
  height: number
  /** Total width of the grid container (defaults to '100%') */
  width?: string | number
  /** Number of columns to display */
  columnCount: number
  /** Function to render each item */
  renderItem: (item: T, rowIndex: number, columnIndex: number) => ReactNode
  /** CSS class name for each cell */
  className?: string
  /** Gap between items in pixels */
  gap?: number
}

/**
 * Virtualized grid component for efficient rendering of large datasets in grid layout
 *
 * @example
 * ```tsx
 * <VirtualizedGrid
 *   items={products}
 *   columnWidth={300}
 *   rowHeight={400}
 *   columnCount={3}
 *   height={800}
 *   renderItem={(product) => (
 *     <ProductCard product={product} />
 *   )}
 * />
 * ```
 */
export function VirtualizedGrid<T>({
  items,
  columnWidth,
  rowHeight,
  height,
  width = '100%',
  columnCount,
  renderItem,
  className,
  gap = 16,
}: VirtualizedGridProps<T>) {
  const rowCount = Math.ceil(items.length / columnCount)

  // Cell renderer for react-window
  const Cell = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number
    rowIndex: number
    style: CSSProperties
  }) => {
    const itemIndex = rowIndex * columnCount + columnIndex

    // Don't render if index is beyond items array
    if (itemIndex >= items.length) {
      return null
    }

    const item = items[itemIndex]

    // Add gap to style
    const styleWithGap: CSSProperties = {
      ...style,
      left: typeof style.left === 'number' ? style.left + gap : style.left,
      top: typeof style.top === 'number' ? style.top + gap : style.top,
      width: typeof style.width === 'number' ? style.width - gap : style.width,
      height: typeof style.height === 'number' ? style.height - gap : style.height,
    }

    return (
      <div style={styleWithGap} className={className}>
        {renderItem(item, rowIndex, columnIndex)}
      </div>
    )
  }

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={columnWidth + gap}
      height={height}
      rowCount={rowCount}
      rowHeight={rowHeight + gap}
      width={width}
    >
      {Cell}
    </Grid>
  )
}

// Re-export hook from separate file to avoid react-refresh warnings
export { useResponsiveColumns } from './useResponsiveColumns'
