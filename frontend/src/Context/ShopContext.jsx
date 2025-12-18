import React, {createContext, useState} from "react";
import all_product from "../assets/all_product";
import CartItems from "../Components/CartItems/CartItems";

export const ShopContext = createContext(null);
const getDefaultCart = () =>{
    let cart = {};
    for(let index=0;index < all_product.length+1;index++){
       cart[index] = 0
    } return cart;
}

const ShopContextProvider = (props) =>{
    const [cartItems,setCartItems] = useState(getDefaultCart())
    

    const addTocart = (itemId) =>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}));
        console.log(cartItems);
        
        
    }
  
        const removeFromCart = (itemId) =>{
            setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1})
            )
        }
  
        const getTotalCartAmount = () =>{
            let totalAmount = 0;
            for(const item in cartItems)
            {
                if(cartItems[item]>0){
                    let itemInfo  = all_product.find((product)=>product.id === Number(item))
                    totalAmount += itemInfo.new_price* cartItems[item];
                }
              
            }
            return totalAmount;
        }

        const getTotalCartItems = () =>{
            let totalItmes = 0;
            for(const item in cartItems)
            {
                if(cartItems[item]>0){
                    totalItmes += cartItems[item];
                }
              
            }
            return totalItmes;
        }
        const contextValue={getTotalCartItems,getTotalCartAmount,all_product,cartItems,addTocart,removeFromCart};
    return (
        <ShopContext.Provider value={contextValue}>
{props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;