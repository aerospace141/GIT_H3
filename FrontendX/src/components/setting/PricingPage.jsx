// PricingPage.jsx
import { useState } from 'react';
import '../../styles/setting/PricingPage.css';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  
//   const plans = [
//     {
//       name: "BASIC",
//       price: "$30.00",
//       headerClass: "basic-header",
//       labelClass: "plan-label-basic",
//       priceClass: "price-basic",
//       buttonClass: "buy-button-basic",
//       features: [
//         { text: "Lorem ipsum dolor sit amet", included: true },
//         { text: "Lorem ipsum dolor sit amet", included: false },
//         { text: "Lorem ipsum dolor sit amet", included: true },
//         { text: "Lorem ipsum dolor sit amet", included: false },
//         { text: "Lorem ipsum dolor sit amet", included: true },
//       ]
//     },
//     {
//       name: "STANDART",
//       price: "$50.00",
//       headerClass: "standard-header",
//       labelClass: "plan-label-standard",
//       priceClass: "price-standard",
//       buttonClass: "buy-button-standard",
//       features: [
//         { text: "Lorem ipsum dolor sit amet", included: true },
//         { text: "Lorem ipsum dolor sit amet", included: false },
//         { text: "Lorem ipsum dolor sit amet", included: true },
//         { text: "Lorem ipsum dolor sit amet", included: false },
//         { text: "Lorem ipsum dolor sit amet", included: true },
//       ]
//     },
//     {
//       name: "PREMIUM",
//       price: "$70.00",
//       headerClass: "premium-header",
//       labelClass: "plan-label-premium",
//       priceClass: "price-premium",
//       buttonClass: "buy-button-premium",
//       features: [
//         { text: "Lorem ipsum dolor sit amet", included: true },
//         { text: "Lorem ipsum dolor sit amet", included: false },
//         { text: "Lorem ipsum dolor sit amet", included: true },
//         { text: "Lorem ipsum dolor sit amet", included: false },
//         { text: "Lorem ipsum dolor sit amet", included: true },
//       ]
//     }
//   ];

const plans = [
    {
      name: "BASIC",
      price: "₹299.00",
      headerClass: "basic-header",
      labelClass: "plan-label-basic",
      priceClass: "price-basic",
      buttonClass: "buy-button-basic",
      features: [
        { text: "General Practice Mode", included: true },
        { text: "Access to 6 Basic Skill Games", included: true },
        { text: "Access to Level 1–3 Courses", included: true },
        { text: "Unlock Advanced Games (5)", included: false },
        { text: "Progress Tracking & Stats", included: false },
        { text: "Personal Mentor Support", included: false }
      ]
    },
    {
      name: "STANDARD",
      price: "₹499.00",
      headerClass: "standard-header",
      labelClass: "plan-label-standard",
      priceClass: "price-standard",
      buttonClass: "buy-button-standard",
      features: [
        { text: "General Practice + All Skill Modes", included: true },
        { text: "Access to 6 Basic + 5 Advanced Games", included: true },
        { text: "Access to Level 1–10 Courses", included: true },
        { text: "Final Exam (Level 11)", included: true },
        { text: "Progress Tracking & Stats", included: true },
        { text: "Personal Mentor Support", included: false }
      ]
    },
    {
      name: "PREMIUM",
      price: "₹799.00",
      headerClass: "premium-header",
      labelClass: "plan-label-premium",
      priceClass: "price-premium",
      buttonClass: "buy-button-premium",
      features: [
        { text: "Everything in Standard Plan", included: true },
        { text: "Access to 2 Next-Level Expert Games", included: true },
        { text: "1-on-1 Personal Mentor Assistance", included: true },
        { text: "Weekly Performance Feedback", included: true },
        { text: "Exclusive Webinars and Tips", included: true },
        { text: "Priority Support", included: true }
      ]
    }
  ];
  
  const handlePlanSelect = (planName) => {
    setSelectedPlan(planName);
    // This is where you would handle gateway setup
    console.log(`Selected plan: ${planName}`);
  };

  return (
    <div className="pricing-container">
      <div className="pricing-wrapper">
        <h1 className="pricing-title">Choose Your Plan</h1>
        
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className="pricing-card">
              {/* Colored header */}
              <div className={`card-header ${plan.headerClass}`}></div>
              
              {/* Plan label */}
              <div className={`plan-label ${plan.labelClass}`}>
                <div className="plan-name">{plan.name}</div>
                <div className="plan-period">PER MONTH</div>
              </div>
              
              {/* Features list */}
              <div className="features-list">
                <ul>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="feature-item">
                      {feature.included ? (
                        <span className="feature-included">✓</span>
                      ) : (
                        <span className="feature-excluded">✕</span>
                      )}
                      <span className="feature-text">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Price */}
                <div className={`price ${plan.priceClass}`}>
                  {plan.price}
                </div>
                
                {/* CTA Button */}
                <button 
                  className={`buy-button ${plan.buttonClass}`}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  BUY NOW
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Gateway Setup Placeholder */}
        {selectedPlan && (
          <div className="gateway-section">
            <h2 className="gateway-title">Payment Gateway Setup</h2>
            <p className="gateway-text">Payment gateway integration would go here for the {selectedPlan} plan.</p>
            {/* This is where you would integrate your payment gateway */}
          </div>
        )}
      </div>
    </div>
  );
}