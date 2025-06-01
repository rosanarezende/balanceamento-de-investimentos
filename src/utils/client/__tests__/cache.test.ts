import { 
  getCachedStockPrice, 
  setCachedStockPrice, 
  clearStockPriceCache, 
  clearAllStockPriceCache 
} from '../cache';

describe('Cache Utils', () => {
  let localStorageMock: any;
  
  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorageMock = {
      data: {} as Record<string, string>,
      getItem: jest.fn((key: string) => localStorageMock.data[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        localStorageMock.data[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete localStorageMock.data[key];
      }),
      clear: jest.fn(() => {
        localStorageMock.data = {};
      }),
      length: 0,
      key: jest.fn((index: number) => {
        const keys = Object.keys(localStorageMock.data);
        return keys[index] || null;
      })
    };
    
    // Update length property
    Object.defineProperty(localStorageMock, 'length', {
      get: () => Object.keys(localStorageMock.data).length
    });
    
    // Mock window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // Clear all cached data
    clearAllStockPriceCache();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setCachedStockPrice', () => {
    it('should store stock price in cache with timestamp', () => {
      const stockCode = 'AAPL34';
      const price = 150.75;
      
      setCachedStockPrice(stockCode, price);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stock_price_AAPL34',
        expect.stringContaining('"value":150.75')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stock_price_AAPL34',
        expect.stringContaining('"timestamp":')
      );
    });

    it('should update existing cache entry', () => {
      const stockCode = 'AAPL34';
      
      setCachedStockPrice(stockCode, 150.75);
      setCachedStockPrice(stockCode, 155.25);
      
      const cachedData = localStorageMock.data['stock_price_AAPL34'];
      const parsed = JSON.parse(cachedData);
      
      expect(parsed.value).toBe(155.25);
    });
  });

  describe('getCachedStockPrice', () => {
    it('should return cached price if not expired', () => {
      const stockCode = 'AAPL34';
      const price = 150.75;
      
      setCachedStockPrice(stockCode, price);
      const cachedPrice = getCachedStockPrice(stockCode);
      
      expect(cachedPrice).toBe(price);
    });

    it('should return null if no cache exists', () => {
      const cachedPrice = getCachedStockPrice('NONEXISTENT');
      expect(cachedPrice).toBeNull();
    });

    it('should return null if cache is expired', () => {
      const stockCode = 'AAPL34';
      const price = 150.75;
      
      // Mock an expired cache entry (older than 5 minutes)
      const expiredTimestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago
      const expiredData = JSON.stringify({
        value: price,
        timestamp: expiredTimestamp
      });
      
      localStorageMock.data['stock_price_AAPL34'] = expiredData;
      
      const cachedPrice = getCachedStockPrice(stockCode);
      expect(cachedPrice).toBeNull();
    });

    it('should handle invalid JSON in cache', () => {
      const stockCode = 'AAPL34';
      
      // Set invalid JSON
      localStorageMock.data['stock_price_AAPL34'] = 'invalid json';
      
      const cachedPrice = getCachedStockPrice(stockCode);
      expect(cachedPrice).toBeNull();
    });

    it('should handle cache entry without required fields', () => {
      const stockCode = 'AAPL34';
      
      // Set cache with missing fields
      localStorageMock.data['stock_price_AAPL34'] = JSON.stringify({
        value: 150.75
        // missing timestamp
      });
      
      const cachedPrice = getCachedStockPrice(stockCode);
      expect(cachedPrice).toBeNull();
    });
  });

  describe('clearStockPriceCache', () => {
    it('should remove specific stock cache', () => {
      const stockCode = 'AAPL34';
      setCachedStockPrice(stockCode, 150.75);
      
      clearStockPriceCache(stockCode);
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('stock_price_AAPL34');
      expect(getCachedStockPrice(stockCode)).toBeNull();
    });

    it('should not affect other stock caches', () => {
      setCachedStockPrice('AAPL34', 150.75);
      setCachedStockPrice('GOOGL34', 120.50);
      
      clearStockPriceCache('AAPL34');
      
      expect(getCachedStockPrice('AAPL34')).toBeNull();
      expect(getCachedStockPrice('GOOGL34')).toBe(120.50);
    });
  });

  describe('clearAllStockPriceCache', () => {
    it('should remove all stock price caches', () => {
      setCachedStockPrice('AAPL34', 150.75);
      setCachedStockPrice('GOOGL34', 120.50);
      setCachedStockPrice('MSFT34', 95.25);
      
      clearAllStockPriceCache();
      
      expect(getCachedStockPrice('AAPL34')).toBeNull();
      expect(getCachedStockPrice('GOOGL34')).toBeNull();
      expect(getCachedStockPrice('MSFT34')).toBeNull();
    });

    it('should not affect non-stock caches', () => {
      // Add stock cache
      setCachedStockPrice('AAPL34', 150.75);
      
      // Add non-stock cache
      localStorageMock.data['user_preference'] = 'some value';
      localStorageMock.data['other_cache'] = 'other value';
      
      clearAllStockPriceCache();
      
      expect(getCachedStockPrice('AAPL34')).toBeNull();
      expect(localStorageMock.data['user_preference']).toBe('some value');
      expect(localStorageMock.data['other_cache']).toBe('other value');
    });

    it('should handle empty cache gracefully', () => {
      expect(() => clearAllStockPriceCache()).not.toThrow();
    });
  });

  describe('Cache TTL (Time To Live)', () => {
    it('should respect 5 minute TTL', () => {
      const stockCode = 'AAPL34';
      const price = 150.75;
      
      // Mock current time
      const mockNow = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(mockNow);
      
      setCachedStockPrice(stockCode, price);
      
      // Check immediately - should be cached
      expect(getCachedStockPrice(stockCode)).toBe(price);
      
      // Mock time 4 minutes later - should still be cached
      jest.spyOn(Date, 'now').mockReturnValue(mockNow + (4 * 60 * 1000));
      expect(getCachedStockPrice(stockCode)).toBe(price);
      
      // Mock time 6 minutes later - should be expired
      jest.spyOn(Date, 'now').mockReturnValue(mockNow + (6 * 60 * 1000));
      expect(getCachedStockPrice(stockCode)).toBeNull();
      
      jest.restoreAllMocks();
    });
  });
});
