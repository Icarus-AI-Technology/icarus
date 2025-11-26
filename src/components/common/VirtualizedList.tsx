/**
 * Virtualized List Component
 *
 * Efficiently renders large lists by only rendering visible items.
 * Uses react-window for virtualization.
 */

/* eslint-disable react-refresh/only-export-components */
import { FixedSizeList as List } from 'react-window'
import { ReactNode, CSSProperties } from 'react'

export interface VirtualizedListProps<T> {
  /** Array of items to render */
  items: T[]
  /** Height of each item in pixels */
  itemHeight: number
  /** Total height of the list container in pixels */
  height: number
  /** Width of the list (defaults to '100%') */
  width?: string | number
  /** Function to render each item */
  renderItem: (item: T, index: number) => ReactNode
  /** CSS class name for the list container */
  className?: string
  /** Number of items to render outside of the visible area (for smoother scrolling) */
  overscanCount?: number
}

/**
 * Virtualized list component that only renders visible items
 *
 * @example
 * ```tsx
 * <VirtualizedList
 *   items={products}
 *   itemHeight={100}
 *   height={600}
 *   renderItem={(product, index) => (
 *     <ProductCard key={product.id} product={product} />
 *   )}
 * />
 * ```
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  width = '100%',
  renderItem,
  className,
  overscanCount = 5,
}: VirtualizedListProps<T>) {
  // Row renderer for react-window
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => {
    const item = items[index]
    return (
      <div style={style} className={className}>
        {renderItem(item, index)}
      </div>
    )
  }

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width={width}
      overscanCount={overscanCount}
    >
      {Row}
    </List>
  )
}

// Re-export hook from separate file to avoid react-refresh warnings
export { useVirtualizedListHeight } from './useVirtualizedListHeight'
