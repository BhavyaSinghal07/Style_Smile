import React from 'react'
import "./Hero.css"
import hand_icon from "../../assets/hand_icon.png"
import arrow_icon from "../../assets/arrow_icon.png"
import men from "../../assets/p8.webp"
const Hero = () => {
  return (
    <div className='hero'>
        <div className="hero-left">
<h2>Best Deals !  Best Prices !</h2>
       
        <div className="hero-hand-icon">
            <p>new</p>
            <img src={hand_icon} alt="" height="60px" />
        </div>
        <p>collections</p>
        <p>for everyone</p>
        <div className="hero-latest-btn">
            <div>Latest Collection</div>
            <img src={arrow_icon} alt="" height="30px"/>
        </div>
        </div>
        
        <div className="hero-right">
  <img src={men} alt="" height="400px" />
        </div>
    </div>
  )
}

export default Hero