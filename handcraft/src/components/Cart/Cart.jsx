import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Cart.module.css"; // Will use similar styling approach
import "@fortawesome/fontawesome-free/css/all.min.css";

const Cart = () => {
  const navigate = useNavigate();
  
  // State for managing cart items, order status and view modes
  const [activeTab, setActiveTab] = useState("cart");
  const [showDelivered, setShowDelivered] = useState(false);
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Handcrafted Wooden Bowl",
      price: 45.99,
      quantity: 2,
      image: "../../assets/products/wooden-bowl.png",
      seller: "ArtisanCrafts"
    },
    {
      id: 2,
      name: "Hand-painted Ceramic Mug",
      price: 24.99,
      quantity: 1,
      image: "../../assets/products/ceramic-mug.png",
      seller: "CeramicWonders"
    }
  ]);
  
  const [orders, setOrders] = useState([
    {
      id: "ORD-2025-001",
      date: "2025-03-01",
      items: [
        { name: "Handcrafted Leather Journal", quantity: 1, price: 39.99 },
        { name: "Custom Knitted Scarf", quantity: 1, price: 29.99 }
      ],
      total: 69.98,
      status: "Delivered",
      trackingNumber: "TRK123456789"
    },
    {
      id: "ORD-2025-002",
      date: "2025-03-05",
      items: [
        { name: "Artisan Soap Collection", quantity: 3, price: 18.99 }
      ],
      total: 56.97,
      status: "Shipped",
      trackingNumber: "TRK987654321"
    }
  ]);
  
  const [transactions, setTransactions] = useState([
    {
      id: "TXN-2025-001",
      date: "2025-03-01",
      amount: 69.98,
      method: "Credit Card",
      orderID: "ORD-2025-001",
      status: "Completed"
    },
    {
      id: "TXN-2025-002",
      date: "2025-03-05",
      amount: 56.97,
      method: "PayPal",
      orderID: "ORD-2025-002",
      status: "Completed"
    }
  ]);

  // Separate orders by status
  const shippedOrders = orders.filter(order => order.status === "Shipped");
  const deliveredOrders = orders.filter(order => order.status === "Delivered");

  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Handle quantity changes
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(
      cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Proceed to checkout
  const handleCheckout = () => {
    navigate("/checkout");
  };

  // Download invoice (placeholder function)
  const downloadInvoice = (orderID) => {
    alert(`Downloading invoice for order ${orderID}...`);
    // In a real app, this would generate and download a PDF
  };

  // Toggle display of delivered orders
  const toggleDeliveredOrders = () => {
    setShowDelivered(!showDelivered);
  };

  return (
    <div className={styles.container}>
      <div className={styles["cart-container"]}>
        {/* Navigation Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === "cart" ? styles.active : ""}`}
            onClick={() => setActiveTab("cart")}
          >
            <i className="fas fa-shopping-cart"></i> Cart
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === "orders" ? styles.active : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <i className="fas fa-box"></i> My Orders
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === "transactions" ? styles.active : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <i className="fas fa-history"></i> Payment History
          </button>
        </div>

        {/* Cart Items View */}
        {activeTab === "cart" && (
          <div className={styles.tabContent}>
            <h2 className={styles.title}>My Shopping Cart</h2>
            
            {cartItems.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fas fa-shopping-cart fa-3x"></i>
                <p>Your cart is empty</p>
                <button className={styles.btn}>Browse Products</button>
              </div>
            ) : (
              <>
                <div className={styles.cartSummary}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping:</span>
                    <span>$5.99</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Tax:</span>
                    <span>${(cartTotal * 0.08).toFixed(2)}</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Total:</span>
                    <span>${(cartTotal + 5.99 + cartTotal * 0.08).toFixed(2)}</span>
                  </div>
                  <button 
                    className={`${styles.btn} ${styles.checkoutBtn}`}
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
