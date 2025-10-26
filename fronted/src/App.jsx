import Header from "./Components/Header";
import { Routes, Route } from "react-router-dom";
import LoginForm from "./Auth/LoginForm";
import SignupForm from "./Auth/SignupForm";
import ProductList from "./Components/Product";
import SingleProduct from "./Components/showSingleProduct";
import CheckoutForm from "./Components/Checkout";
import OrderConfirmation from "./Components/OrderConfirmation";
import MilitaryBlogCSS from "./Components/JaberVai";
import ForgetPassword from "./Auth/ForgetPassword";
import ChatInterface from "./Components/Message";
import UserManagement from "./Components/UserManagement";
import Checking from "./Components/Checking";
import VoiceMessage from "./Components/VoiceMessage";
// import PixelTrackingDemo from "./Components/PixelTrackingDemo";
import "tailwindcss";


function App() {

  return (
    <>
      <Header />
      <div>
         <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/Auth/signup" element={<SignupForm />} />
            <Route path="/Auth/login" element={<LoginForm />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/singleProduct/:id"  element={<SingleProduct />} />
            <Route path="/checkout" element={<CheckoutForm />} />
            <Route path="/orderconfirmation" element={<OrderConfirmation />} />
            <Route path="/jabervai" element={<MilitaryBlogCSS />} />
            <Route path="/auth/forget-password" element={<ForgetPassword />} />
            <Route path="/messages" element={<ChatInterface />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/checking" element={<Checking />} />
            <Route path="/voice-message" element={ <VoiceMessage />} />
            {/* <Route path="/pixel-tracking-demo" element={ <PixelTrackingDemo />} /> */}
         </Routes>
      </div>
    
    </>
  );
}

export default App;
