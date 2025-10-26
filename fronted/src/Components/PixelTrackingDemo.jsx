// import React, { useEffect } from 'react';

// // Pixel Tracking Service
// class PixelTracker {
//   constructor(apiEndpoint, pixelId) {
//     this.apiEndpoint = apiEndpoint;
//     this.pixelId = pixelId;
//     this.sessionId = this.getOrCreateSessionId();
//     this.userId = this.getUserId();
//   }

//   // Generate or retrieve session ID
//   getOrCreateSessionId() {
//     let sessionId = sessionStorage.getItem('pixel_session_id');
//     if (!sessionId) {
//       sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//       sessionStorage.setItem('pixel_session_id', sessionId);
//     }
//     return sessionId;
//   }

//   // Get user ID if logged in
//   getUserId() {
//     return localStorage.getItem('user_id') || null;
//   }

//   // Get browser and device info
//   getBrowserInfo() {
//     return {
//       userAgent: navigator.userAgent,
//       language: navigator.language,
//       screenResolution: `${window.screen.width}x${window.screen.height}`,
//       viewport: `${window.innerWidth}x${window.innerHeight}`,
//       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       platform: navigator.platform
//     };
//   }

//   // Get referrer info
//   getReferrer() {
//     return {
//       referrer: document.referrer || 'direct',
//       currentUrl: window.location.href,
//       utmSource: new URLSearchParams(window.location.search).get('utm_source'),
//       utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
//       utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign')
//     };
//   }

//   // Send tracking event
//   async track(eventType, eventData = {}) {
//     const payload = {
//       pixel_id: this.pixelId,
//       session_id: this.sessionId,
//       user_id: this.userId,
//       event_type: eventType,
//       event_data: eventData,
//       browser_info: this.getBrowserInfo(),
//       referrer_info: this.getReferrer(),
//       timestamp: new Date().toISOString()
//     };

//     try {
//       // Use sendBeacon for reliability (works even when page is closing)
//       if (navigator.sendBeacon) {
//         const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
//         navigator.sendBeacon(`${this.apiEndpoint}/track`, blob);
//       } else {
//         // Fallback to fetch
//         await fetch(`${this.apiEndpoint}/track`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(payload),
//           keepalive: true
//         });
//       }
//     } catch (error) {
//       console.error('Pixel tracking error:', error);
//     }
//   }

//   // Track page view
//   trackPageView() {
//     this.track('page_view', {
//       page: window.location.pathname,
//       title: document.title
//     });
//   }

//   // Track product view
//   trackProductView(product) {
//     this.track('product_view', {
//       product_id: product.id,
//       product_name: product.name,
//       price: product.price,
//       category: product.category
//     });
//   }

//   // Track add to cart
//   trackAddToCart(product, quantity = 1) {
//     this.track('add_to_cart', {
//       product_id: product.id,
//       product_name: product.name,
//       price: product.price,
//       quantity: quantity,
//       value: product.price * quantity
//     });
//   }

//   // Track purchase
//   trackPurchase(orderData) {
//     this.track('purchase', {
//       order_id: orderData.orderId,
//       total: orderData.total,
//       currency: orderData.currency || 'USD',
//       products: orderData.products,
//       shipping: orderData.shipping,
//       tax: orderData.tax
//     });
//   }

//   // Track search
//   trackSearch(query, results = null) {
//     this.track('search', {
//       query: query,
//       results_count: results
//     });
//   }

//   // Track custom event
//   trackCustomEvent(eventName, data) {
//     this.track(eventName, data);
//   }
// }

// // React Hook for Pixel Tracking
// export const usePixelTracking = (apiEndpoint, pixelId) => {
//   const [tracker, setTracker] = React.useState(null);

//   useEffect(() => {
//     const pixelTracker = new PixelTracker(apiEndpoint, pixelId);
//     setTracker(pixelTracker);

//     // Track initial page view
//     pixelTracker.trackPageView();

//     // Track page unload
//     const handleUnload = () => {
//       pixelTracker.track('page_exit', {
//         duration: Date.now() - performance.timing.navigationStart
//       });
//     };

//     window.addEventListener('beforeunload', handleUnload);

//     return () => {
//       window.removeEventListener('beforeunload', handleUnload);
//     };
//   }, [apiEndpoint, pixelId]);

//   return tracker;
// };

// // Demo Component
// export default function PixelTrackingDemo() {
//   const API_ENDPOINT = 'http://127.0.0.1:8000/api/v1/pixels';
//   const PIXEL_ID = 'px_123456789';
  
//   const tracker = usePixelTracking(API_ENDPOINT, PIXEL_ID);

//   const demoProduct = {
//     id: 'prod_123',
//     name: 'Premium Laptop',
//     price: 1299.99,
//     category: 'Electronics'
//   };

//   const handleProductView = () => {
//     if (tracker) {
//       tracker.trackProductView(demoProduct);
//       // alert('Product view tracked!');
//     }
//   };

//   const handleAddToCart = () => {
//     if (tracker) {
//       tracker.trackAddToCart(demoProduct, 1);
//       // alert('Add to cart tracked!');
//     }
//   };

//   const handlePurchase = () => {
//     if (tracker) {
//       tracker.trackPurchase({
//         orderId: 'ORD_' + Date.now(),
//         total: 1299.99,
//         currency: 'USD',
//         products: [demoProduct],
//         shipping: 0,
//         tax: 104.00
//       });
//       // alert('Purchase tracked!');
//     }
//   };

//   const handleSearch = () => {
//     if (tracker) {
//       tracker.trackSearch('laptop', 15);
//       // alert('Search tracked!');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <div className="text-center mb-8">
//             <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
//               <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//               </svg>
//             </div>
//             <h1 className="text-4xl font-bold text-gray-900 mb-2">
//               Pixel Tracking System
//             </h1>
//             <p className="text-gray-600">
//               Professional e-commerce analytics tracking
//             </p>
//           </div>

//           <div className="bg-gray-50 rounded-xl p-6 mb-8">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Tracking Information
//             </h2>
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <span className="text-gray-600">Session ID:</span>
//                 <p className="font-mono text-xs text-gray-900 mt-1 break-all">
//                   {tracker?.sessionId || 'Loading...'}
//                 </p>
//               </div>
//               <div>
//                 <span className="text-gray-600">Pixel ID:</span>
//                 <p className="font-mono text-xs text-gray-900 mt-1">
//                   {PIXEL_ID}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-4 mb-8">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4">
//               Test Tracking Events
//             </h2>
            
//             <button
//               onClick={handleProductView}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-between group"
//             >
//               <span>Track Product View</span>
//               <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//               </svg>
//             </button>

//             <button
//               onClick={handleAddToCart}
//               className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-between group"
//             >
//               <span>Track Add to Cart</span>
//               <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//               </svg>
//             </button>

//             <button
//               onClick={handlePurchase}
//               className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-between group"
//             >
//               <span>Track Purchase</span>
//               <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//               </svg>
//             </button>

//             <button
//               onClick={handleSearch}
//               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-between group"
//             >
//               <span>Track Search</span>
//               <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </button>
//           </div>

//           <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//             <p className="text-sm text-amber-800">
//               <strong>Note:</strong> Check your browser's console and network tab to see tracking events being sent.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect } from "react"
// import { NavLink } from "react-router-dom"
// import { usePixelTracker } from "./usePixelTracker" // Import the hook
// import "../ProductList.css"

// const ProductList = () => {
//   const [products, setProducts] = useState([])
//   const [loading, setLoading] = useState(true)
  
//   // Initialize pixel tracker
//   const { trackEvent } = usePixelTracker('http://127.0.0.1:8000/api/v1/pixels')

//   const fetchData = async () => {
//     try {
//       setLoading(true)

//       const response = await fetch("http://127.0.0.1:8000/api/products")

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const result = await response.json()
//       console.log(result)
//       let productsArray = []

//       if (result.products && Array.isArray(result.products.data)) productsArray = result.products.data
//       else if (Array.isArray(result.products)) productsArray = result.products
//       else if (Array.isArray(result.data)) productsArray = result.data
//       else productsArray = []

//       setProducts(productsArray)
      
//       // Track products loaded event
//       trackEvent('products_loaded', {
//         count: productsArray.length,
//         page: 'product_list'
//       })
//     } catch (err) {
//       console.error("Fetch error:", err)
      
//       // Track error event
//       trackEvent('fetch_error', {
//         error: err.message,
//         page: 'product_list'
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchData()
    
//     // Track page view
//     trackEvent('page_view', {
//       page_name: 'product_list',
//       page_path: window.location.pathname
//     })
//   }, [])

//   // Track product view
//   const handleProductView = (product) => {
//     trackEvent('product_view', {
//       product_id: product.id,
//       product_name: product.name,
//       price: product.price,
//       category: product.category || 'general',
//       image_url: product.image_url
//     })
//     console.log('Product viewed:', product.name)
//   }

//   // Track product click
//   const handleProductClick = (product) => {
//     trackEvent('product_click', {
//       product_id: product.id,
//       product_name: product.name,
//       price: product.price,
//       action: 'shop_now_clicked'
//     })
//     console.log('Product clicked:', product.name)
//   }

//   // Loading state
//   if (loading) {
//     return (
//       <div className="products-container">
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <span className="loading-text">Loading products...</span>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="products-container">
//       <div className="products-wrapper">
//         {products.length === 0 ? (
//           <div className="empty-state">
//             <div className="empty-state-content">
//               <h3>No products available</h3>
//               <p>Check back later for new products.</p>
//             </div>
//           </div>
//         ) : (
//           <div className="products-grid">
//             {Array.isArray(products) &&
//               products.map((product) => (
//                 <div 
//                   key={product.id} 
//                   className="product-card"
//                   onMouseEnter={() => handleProductView(product)}
//                 >
//                   <div className="product-image-container">
//                     <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="product-image" />
//                     <div className="product-overlay">
//                       <span className="quick-view">Quick View</span>
//                     </div>
//                   </div>

//                   <div className="product-content">
//                     <h3 className="product-title">{product.name}</h3>
//                     <p className="product-description">{product.description}</p>

//                     <div className="product-meta">
//                       <div className="product-price">${product.price}</div>
//                       {product.weight && <div className="product-weight">{product.weight}</div>}
//                     </div>

//                     <NavLink 
//                       to={`/singleProduct/${product.id}`} 
//                       className="shop-now-btn"
//                       onClick={() => handleProductClick(product)}
//                     >
//                       Shop Now
//                     </NavLink>
//                   </div>
//                 </div>
//               ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default ProductList