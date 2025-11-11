# 03 - 前端架構設計

## 技術棧總覽

### 核心框架
- **React 18**：最新版本，支援 Concurrent Features
- **TypeScript**：型別安全，提升開發體驗
- **Vite**：快速建構工具，HMR 熱更新

### 樣式與 UI
- **TailwindCSS**：原子化 CSS 框架
- **Headless UI**：無樣式組件庫
- **Framer Motion**：流暢動畫效果
- **Lucide React**：現代化圖標庫

### 狀態管理
- **Zustand**：輕量級狀態管理
- **React Query**：伺服器狀態管理
- **React Hook Form**：表單狀態管理

## 專案結構

```
src/
├── components/           # 可重用組件
│   ├── ui/              # 基礎 UI 組件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   ├── layout/          # 佈局組件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── features/        # 功能組件
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   └── orders/
│   └── common/          # 通用組件
│       ├── Loading.tsx
│       ├── ErrorBoundary.tsx
│       └── SEO.tsx
├── pages/               # 頁面組件
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── admin/
├── hooks/               # 自定義 Hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useProducts.ts
│   └── useLocalStorage.ts
├── services/            # API 服務
│   ├── api.ts
│   ├── auth.ts
│   ├── products.ts
│   ├── orders.ts
│   └── upload.ts
├── store/               # 狀態管理
│   ├── authStore.ts
│   ├── cartStore.ts
│   ├── productStore.ts
│   └── index.ts
├── utils/               # 工具函數
│   ├── constants.ts
│   ├── helpers.ts
│   ├── validators.ts
│   └── formatters.ts
├── types/               # TypeScript 型別
│   ├── auth.ts
│   ├── product.ts
│   ├── order.ts
│   └── api.ts
├── styles/              # 樣式文件
│   ├── globals.css
│   ├── components.css
│   └── animations.css
└── App.tsx              # 根組件
```

## Component 架構設計

### 1. Header 組件
```typescript
// components/layout/Header.tsx
interface HeaderProps {
  isAuthenticated: boolean;
  cartItemsCount: number;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, cartItemsCount, user }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            <SearchButton />
            <CartButton count={cartItemsCount} />
            {isAuthenticated ? (
              <UserMenu user={user} />
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
```

### 2. ProductCard 組件
```typescript
// components/features/products/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <motion.div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary">{product.category}</Badge>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          
          <Button
            onClick={() => onAddToCart(product)}
            className="bg-black text-white hover:bg-gray-800"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
```

### 3. Cart 組件
```typescript
// components/features/cart/Cart.tsx
const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const { data: products } = useProducts();
  
  const cartItems = items.map(item => ({
    ...item,
    product: products?.find(p => p.id === item.productId)
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
                onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
              />
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary items={cartItems} />
          </div>
        </div>
      )}
    </div>
  );
};
```

### 4. AdminPanel 組件
```typescript
// components/features/admin/AdminPanel.tsx
const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 p-8">
          <Switch>
            <Route path="/admin/dashboard" component={Dashboard} />
            <Route path="/admin/products" component={ProductManagement} />
            <Route path="/admin/orders" component={OrderManagement} />
            <Route path="/admin/users" component={UserManagement} />
            <Route path="/admin/analytics" component={Analytics} />
          </Switch>
        </main>
      </div>
    </div>
  );
};
```

## API 串接設計

### API 服務層
```typescript
// services/api.ts
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // GET 請求
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST 請求
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT 請求
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE 請求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_URL);
```

### 商品 API
```typescript
// services/products.ts
export const productApi = {
  // 獲取商品列表
  getProducts: (params?: ProductQueryParams) => 
    apiClient.get<ProductListResponse>(`/products?${new URLSearchParams(params)}`),
  
  // 獲取單一商品
  getProduct: (id: string) => 
    apiClient.get<Product>(`/products/${id}`),
  
  // 搜尋商品
  searchProducts: (query: string) => 
    apiClient.get<Product[]>(`/products/search?q=${query}`),
  
  // 獲取商品分類
  getCategories: () => 
    apiClient.get<Category[]>('/products/categories'),
  
  // 創建商品 (管理員)
  createProduct: (data: CreateProductData) => 
    apiClient.post<Product>('/products', data),
  
  // 更新商品 (管理員)
  updateProduct: (id: string, data: UpdateProductData) => 
    apiClient.put<Product>(`/products/${id}`, data),
  
  // 刪除商品 (管理員)
  deleteProduct: (id: string) => 
    apiClient.delete(`/products/${id}`),
};
```

### 購物車 API
```typescript
// services/cart.ts
export const cartApi = {
  // 獲取購物車
  getCart: () => 
    apiClient.get<Cart>('/cart'),
  
  // 加入商品到購物車
  addToCart: (productId: string, quantity: number = 1) => 
    apiClient.post<CartItem>('/cart/items', { productId, quantity }),
  
  // 更新購物車商品數量
  updateCartItem: (itemId: string, quantity: number) => 
    apiClient.put<CartItem>(`/cart/items/${itemId}`, { quantity }),
  
  // 移除購物車商品
  removeFromCart: (itemId: string) => 
    apiClient.delete(`/cart/items/${itemId}`),
  
  // 清空購物車
  clearCart: () => 
    apiClient.delete('/cart'),
};
```

## State Management

### Zustand Store 設計
```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // State
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,

  // Actions
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login({ email, password });
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true });
    try {
      const response = await authApi.register(userData);
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user: User) => set({ user }),
  setToken: (token: string) => set({ token }),
}));
```

### 購物車 Store
```typescript
// store/cartStore.ts
interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartState & CartActions>((set, get) => ({
  // State
  items: [],
  total: 0,
  itemCount: 0,

  // Actions
  addItem: (product: Product, quantity: number = 1) => {
    const { items } = get();
    const existingItem = items.find(item => item.productId === product.id);
    
    if (existingItem) {
      set(state => ({
        items: state.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      }));
    } else {
      set(state => ({
        items: [...state.items, {
          id: generateId(),
          productId: product.id,
          product,
          quantity,
          price: product.price,
        }],
      }));
    }
    
    get().calculateTotals();
  },

  removeItem: (itemId: string) => {
    set(state => ({
      items: state.items.filter(item => item.id !== itemId),
    }));
    get().calculateTotals();
  },

  updateQuantity: (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    
    set(state => ({
      items: state.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    }));
    get().calculateTotals();
  },

  clearCart: () => {
    set({ items: [], total: 0, itemCount: 0 });
  },

  calculateTotals: () => {
    const { items } = get();
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ total, itemCount });
  },

  syncWithServer: async () => {
    try {
      const cartData = await cartApi.getCart();
      set({ items: cartData.items });
      get().calculateTotals();
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
  },
}));
```

## Routing 規劃

### React Router 設定
```typescript
// App.tsx
const App: React.FC = () => {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-white">
              <Routes>
                {/* 公開路由 */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<Home />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/:id" element={<ProductDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                </Route>

                {/* 認證路由 */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* 受保護路由 */}
                <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
                  <Route path="profile" element={<UserProfile />} />
                  <Route path="orders" element={<UserOrders />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                </Route>

                {/* 結帳路由 */}
                <Route path="/checkout" element={<ProtectedRoute><CheckoutLayout /></ProtectedRoute>}>
                  <Route index element={<Checkout />} />
                  <Route path="success" element={<CheckoutSuccess />} />
                  <Route path="cancel" element={<CheckoutCancel />} />
                </Route>

                {/* 管理員路由 */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* 404 頁面 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
};
```

### 路由守衛
```typescript
// components/common/ProtectedRoute.tsx
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// components/common/AdminRoute.tsx
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

## 環境變數管理

### 環境變數設定
```bash
# .env.development
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=E-commerce Store
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_SENTRY_DSN=https://...
```

### 環境變數驗證
```typescript
// utils/env.ts
const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_STRIPE_PUBLISHABLE_KEY',
] as const;

export const env = {
  API_URL: import.meta.env.VITE_API_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME || 'E-commerce Store',
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  NODE_ENV: import.meta.env.MODE,
} as const;

// 驗證必要的環境變數
requiredEnvVars.forEach(envVar => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

## 效能優化策略

### 代碼分割
```typescript
// 懶載入組件
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const ProductManagement = lazy(() => import('../pages/admin/ProductManagement'));
const Analytics = lazy(() => import('../pages/admin/Analytics'));

// 路由層級的代碼分割
const AdminRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="products" element={<ProductManagement />} />
      <Route path="analytics" element={<Analytics />} />
    </Routes>
  </Suspense>
);
```

### 圖片優化
```typescript
// components/common/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400">Image not available</span>
        </div>
      )}
    </div>
  );
};
```

### 快取策略
```typescript
// hooks/useProducts.ts
export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 分鐘
    cacheTime: 10 * 60 * 1000, // 10 分鐘
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 分鐘
  });
};
```

## 錯誤處理

### Error Boundary
```typescript
// components/common/ErrorBoundary.tsx
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 發送到錯誤追蹤服務
    if (env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### API 錯誤處理
```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  if (error.response) {
    // 伺服器回應錯誤
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || '請求參數錯誤';
      case 401:
        return '請先登入';
      case 403:
        return '權限不足';
      case 404:
        return '資源不存在';
      case 500:
        return '伺服器錯誤，請稍後再試';
      default:
        return data.message || '發生未知錯誤';
    }
  } else if (error.request) {
    // 網路錯誤
    return '網路連線失敗，請檢查網路設定';
  } else {
    // 其他錯誤
    return '發生未知錯誤';
  }
};
```

這個前端架構設計提供了完整的現代化電商平台基礎，包含組件化設計、狀態管理、API 串接、路由規劃等核心功能，同時注重效能優化和錯誤處理。


