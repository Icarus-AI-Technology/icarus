/**
 * Virtualized Product List Component
 *
 * Example implementation of VirtualizedList for product catalogs.
 * This can be used as a reference for implementing virtualization in other modules.
 */

import { VirtualizedList } from './VirtualizedList'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/formatters'
import { Package, Edit, Trash2 } from 'lucide-react'

// Example product type (adjust to match your actual Product type)
export interface Product {
  id: string
  code: string
  name: string
  category_name?: string
  stock_quantity: number
  min_stock: number
  sale_price: number
  active: boolean
}

interface VirtualizedProductListProps {
  products: Product[]
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
  height?: number
}

/**
 * Example virtualized product list component
 *
 * Use this as a reference for implementing virtualization in your modules.
 * For lists with 1000+ items, this can improve performance by 10-20x.
 */
export function VirtualizedProductList({
  products,
  onEdit,
  onDelete,
  height = 600,
}: VirtualizedProductListProps) {
  const getStockBadge = (product: Product) => {
    if (product.stock_quantity <= 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    }
    if (product.stock_quantity < product.min_stock) {
      return <Badge variant="destructive">Crítico</Badge>
    }
    if (product.stock_quantity < product.min_stock * 2) {
      return <Badge className="bg-yellow-500">Baixo</Badge>
    }
    return <Badge variant="default">Normal</Badge>
  }

  return (
    <VirtualizedList
      items={products}
      itemHeight={120}
      height={height}
      renderItem={(product) => (
        <Card key={product.id} className="mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Package className="h-10 w-10 text-muted-foreground" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.code}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Categoria</div>
                    <div className="font-medium">{product.category_name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Estoque</div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.stock_quantity}</span>
                      {getStockBadge(product)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Preço</div>
                    <div className="font-medium">{formatCurrency(product.sale_price)}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    />
  )
}
