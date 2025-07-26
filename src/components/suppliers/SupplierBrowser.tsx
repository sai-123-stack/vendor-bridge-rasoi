import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Store, MapPin, Star, ShoppingCart, Plus } from 'lucide-react';
import { 
  getAllSuppliers, 
  getAllInventory,
  searchInventoryByName,
  getInventoryByCategory,
  Supplier,
  InventoryItem 
} from '@/lib/firestore';

const CATEGORIES = [
  'all',
  'vegetables',
  'spices',
  'grains',
  'dairy',
  'oil',
  'snacks',
  'beverages',
  'packaging',
  'other'
];

interface CartItem extends InventoryItem {
  quantity: number;
}

const SupplierBrowser: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [viewMode, setViewMode] = useState<'suppliers' | 'products'>('suppliers');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (viewMode === 'products') {
      filterProducts();
    }
  }, [searchTerm, selectedCategory, viewMode]);

  const loadData = async () => {
    try {
      const [suppliersData, inventoryData] = await Promise.all([
        getAllSuppliers(),
        getAllInventory()
      ]);
      setSuppliers(suppliersData);
      setInventory(inventoryData);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_load_data'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = async () => {
    try {
      let filteredItems: InventoryItem[] = [];
      
      if (searchTerm) {
        filteredItems = await searchInventoryByName(searchTerm);
      } else if (selectedCategory !== 'all') {
        filteredItems = await getInventoryByCategory(selectedCategory);
      } else {
        filteredItems = inventory;
      }
      
      setInventory(filteredItems);
    } catch (error) {
      console.error('Error filtering products:', error);
    }
  };

  const getSupplierInventory = (supplierId: string) => {
    return inventory.filter(item => item.supplierId === supplierId);
  };

  const getSupplierById = (supplierId: string) => {
    return suppliers.find(supplier => supplier.userId === supplierId);
  };

  const addToCart = (item: InventoryItem, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity }];
      }
    });
    
    toast({
      title: t('success'),
      description: t('item_added_to_cart')
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const groupCartBySupplier = () => {
    const grouped: { [supplierId: string]: CartItem[] } = {};
    
    cart.forEach(item => {
      if (!grouped[item.supplierId]) {
        grouped[item.supplierId] = [];
      }
      grouped[item.supplierId].push(item);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Store className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('loading_suppliers')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('browse_suppliers')}</h2>
          <p className="text-muted-foreground">{t('find_raw_materials')}</p>
        </div>
        
        {cart.length > 0 && (
          <Button variant="outline" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            {t('cart')} ({cart.length})
          </Button>
        )}
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'suppliers' | 'products')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suppliers">{t('suppliers')}</TabsTrigger>
          <TabsTrigger value="products">{t('products')}</TabsTrigger>
        </TabsList>

        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder={viewMode === 'suppliers' ? t('search_suppliers') : t('search_products')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          {viewMode === 'products' && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {t(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suppliers
              .filter(supplier => 
                !searchTerm || 
                supplier.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.location.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((supplier) => {
                const supplierItems = getSupplierInventory(supplier.userId);
                
                return (
                  <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{supplier.storeName}</CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{supplier.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{supplier.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {t('total_orders')}: {supplier.totalOrders}
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">{t('available_items')} ({supplierItems.length})</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {supplierItems.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span>{item.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">₹{item.price}/{t(item.unit)}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addToCart(item)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {supplierItems.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              +{supplierItems.length - 5} {t('more_items')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button className="w-full" variant="outline">
                        {t('view_all_items')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {inventory.map((item) => {
              const supplier = getSupplierById(item.supplierId);
              const cartItem = cart.find(cartItem => cartItem.id === item.id);
              
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {t(item.category)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">₹{item.price}</div>
                        <div className="text-xs text-muted-foreground">/{t(item.unit)}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {supplier && (
                      <div className="flex items-center gap-2 text-sm">
                        <Store className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{supplier.storeName}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('stock')}</span>
                      <span className={`font-medium ${item.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.stock} {t(item.unit)}
                      </span>
                    </div>
                    
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      {cartItem ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.id!, cartItem.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="px-2 py-1 bg-muted rounded text-sm font-medium">
                            {cartItem.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.id!, cartItem.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          className="flex-1 gap-2"
                          disabled={item.stock === 0}
                        >
                          <Plus className="w-3 h-3" />
                          {t('add_to_cart')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Card className="fixed bottom-4 right-4 w-80 shadow-xl border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {t('cart')} ({cart.length} {t('items')})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-32 overflow-y-auto space-y-2">
              {Object.entries(groupCartBySupplier()).map(([supplierId, items]) => {
                const supplier = getSupplierById(supplierId);
                const supplierTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
                
                return (
                  <div key={supplierId} className="border rounded-lg p-2">
                    <div className="font-medium text-sm">{supplier?.storeName}</div>
                    <div className="text-xs text-muted-foreground">
                      {items.length} {t('items')} - ₹{supplierTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-bold">
                <span>{t('total')}</span>
                <span className="text-primary">₹{getCartTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setCart([])}>
                {t('clear_cart')}
              </Button>
              <Button>
                {t('place_order')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupplierBrowser;