import React, { useContext } from 'react'
import "./ProductDisplay.css"
import star_icon from "../../assets/star_icon.png"
import star_dull_icon from "../../assets/star_dull_icon.png";
import { ShopContext } from '../../Context/ShopContext';
const ProductDisplay = (props) => {
  const { product } = props;
  const {addTocart} = useContext(ShopContext);
  return (
    <div className='productdisplay'>
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={product.image} alt="" height="150px" />
          <img src={product.image} alt="" height="150px" />
          <img src={product.image} alt="" height="150px" />
        </div>
        <div className='productdisplay-img'>
          <img className='productdisplay-main-img' src={product.image} alt="" height="300px" />
        </div>
      </div>
      <div className="productdisplay-right">
<h1>{product.name}</h1>
<div className="productdisplay-right-star">
  <img src={star_icon} alt="" height="20px" />
  <img src={star_icon} alt="" height="20px" />
  <img src={star_icon} alt="" height="20px" />
  <img src={star_icon} alt="" height="20px" />
  <img src={star_dull_icon} alt="" height="20px" />
  <p>(130)</p>
</div>
<div className="productdisplay-right-prices">
  <div className="productdisplay-right-price-old">
${product.old_price}
  </div>
  <div className="productdisplay-right-price-new">
    ${product.new_price}
  </div>
  </div>
  <div className="productdisplay-right-description">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, eaque. Amet reiciendis minus modi eum soluta hic autem, rem corrupti quibusdam? Quam omnis saepe et expedita ratione, quasi unde repudiandae.
  </div>
  <div className='productdisplay-right-size'>
    <h1>Select Size</h1>
    <div className="productdisplay-right-sizes">
      <div>S</div>
      <div>M</div>
      <div>L</div>
      <div>XL</div>
      <div>XXL</div>
    </div>
  </div>
  <button onClick={()=>{addTocart(product.id)}}>ADD TO CART</button>
  <div className="productdisplay-right-category">
    <span>Category:<span>Women ,T-Shirt , Crop Top</span></span>
  </div>
  <div className="productdisplay-right-category">
    <span>Tags:<span>Modern ,Latest , Trend Shorts</span></span>
  </div>
</div>
      </div>
    
  )
}

export default ProductDisplay