// import { useState, useEffect } from "react"
// import { NavLink } from "react-router-dom"
// import "../ProductList.css"

// const ProductList = () => {
//   const [products, setProducts] = useState([])
//   const [loading, setLoading] = useState(true)

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
//     } catch (err) {
//       console.error("Fetch error:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchData()
//   }, [])

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
//                 <div key={product.id} className="product-card">
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

//                     <NavLink to={`/singleProduct/${product.id}`} className="shop-now-btn">
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
import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { usePixelTracker } from "./usePixelTracker" // Import the hook
import "../ProductList.css"

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Initialize pixel tracker
  const { trackEvent } = usePixelTracker('http://127.0.0.1:8000/api/v1/pixels')

  const fetchData = async () => {
    try {
      setLoading(true)

      const response = await fetch("http://127.0.0.1:8000/api/products")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log(result)
      let productsArray = []

      if (result.products && Array.isArray(result.products.data)) productsArray = result.products.data
      else if (Array.isArray(result.products)) productsArray = result.products
      else if (Array.isArray(result.data)) productsArray = result.data
      else productsArray = []

      setProducts(productsArray)
      
      // Track products loaded event
      trackEvent('products_loaded', {
        count: productsArray.length,
        page: 'product_list'
      })
    } catch (err) {
      console.error("Fetch error:", err)
      
      // Track error event
      trackEvent('fetch_error', {
        error: err.message,
        page: 'product_list'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Track page view
    trackEvent('page_view', {
      page_name: 'product_list',
      page_path: window.location.pathname
    })
  }, [])

  // Track product view
  const handleProductView = (product) => {
    trackEvent('product_view', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      category: product.category || 'general',
      image_url: product.image_url
    })
    console.log('Product viewed:', product.name)
  }

  // Track product click
  const handleProductClick = (product) => {
    trackEvent('product_click', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      action: 'shop_now_clicked'
    })
    console.log('Product clicked:', product.name)
  }

  // Loading state
  if (loading) {
    return (
      <div className="products-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading products...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="products-container">
      <div className="products-wrapper">
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>No products available</h3>
              <p>Check back later for new products.</p>
            </div>
          </div>
        ) : (
          <div className="products-grid">
            {Array.isArray(products) &&
              products.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onMouseEnter={() => handleProductView(product)}
                >
                  <div className="product-image-container">
                    <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="product-image" />
                    <div className="product-overlay">
                      <span className="quick-view">Quick View</span>
                    </div>
                  </div>

                  <div className="product-content">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-description">{product.description}</p>

                    <div className="product-meta">
                      <div className="product-price">${product.price}</div>
                      {product.weight && <div className="product-weight">{product.weight}</div>}
                    </div>

                    <NavLink 
                      to={`/singleProduct/${product.id}`} 
                      className="shop-now-btn"
                      onClick={() => handleProductClick(product)}
                    >
                      Shop Now
                    </NavLink>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList
