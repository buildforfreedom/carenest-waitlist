/**
 * CareNest Landing Page 
 * ----------------------------------------
 * This file serves as the main entry point and UI mapping for the CareNest 
 * intent-capture landing page. It is styled following the strict, brutalist 
 * "Y Combinator" design language to establish technological superiority and trust.
 */

import React, { useState, useEffect } from 'react';
import { MapPin, ArrowUpRight, Minus } from 'lucide-react';
import './App.css';

const App = () => {
  // --- APPLICATION STATE ---
  const [buyInCount, setBuyInCount] = useState(0); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({ name: '', contact: '', questions: '' });
  
  // Interaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  /**
   * INITIALIZATION EFFECT
   * - Checks local memory to avoid showing the form if the user already opted-in today.
   * - Polls the backend API securely to get the real global waitlist count.
   */
  useEffect(() => {
    const previouslySubmitted = localStorage.getItem('carenest_waitlist_ok');
    if (previouslySubmitted) {
      setHasSubmitted(true);
    }
    
    const fetchWaitlistCount = async () => {
      try {
        const res = await fetch('/api/waitlist/count');
        const data = await res.json();
        if (data.count) {
          setBuyInCount(data.count);
        }
      } catch (err) {
        console.error("Server sync failed:", err);
      }
    };
    fetchWaitlistCount();
  }, []);

  /**
   * HANDLERS
   */
  const handleOpenModal = () => {
    if (!hasSubmitted) {
      setServerError('');
      setIsModalOpen(true);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError('');
    
    try {
      // Dispatch payload to our secure Node proxy
      const response = await fetch('/api/waitlist/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || "A connection error occurred. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Success State Update
      setBuyInCount(data.count);
      setHasSubmitted(true);
      localStorage.setItem('carenest_waitlist_ok', 'true');
      
      // Auto-close modal after 3 seconds of showing success message
      setTimeout(() => setIsModalOpen(false), 3000);
      
    } catch (error) {
      setServerError("Network error. Your connection might be unstable.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- VIEW RENDERING ---
  return (
    <div className="app-container">
      
      {/* 1. ANNOUNCEMENT BANNER */}
      <div className="top-banner">
        <strong>{buyInCount.toLocaleString()} families</strong> have already joined the priority waitlist.
      </div>

      {/* 2. NAVIGATION BAR */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <strong>CareNest</strong>
          </div>
          <div className="nav-links">
            <a href="#platform">The Platform</a>
            <a href="#locations">Locations</a>
          </div>
        </div>
      </nav>

      {/* 3. HERO OVERVIEW */}
      <header className="hero">
        
        {/* Left Column: Copy & Actions */}
        <div className="hero-content">
          <h1 className="hero-title">Bridge the distance.<br/>Ensure their care.</h1>
          <p className="hero-subtitle">
            CareNest is a clinical operating system designed for global professionals with aging parents in India. We combine smart health tech apps, active physician oversight, and regular nurse visits so you can monitor your parents' health seamlessly from anywhere in the world.
          </p>
          
          <div className="hero-actions">
             <button className="primary-btn" onClick={handleOpenModal} disabled={hasSubmitted}>
               {hasSubmitted ? "Already Waitlisted ✓" : "Join the Waitlist (Zero Commitment)"}
             </button>
             <p className="pricing-hint">Target Launch Pricing: <strong>$100 / month</strong></p>
          </div>
        </div>

        {/* Right Column: Visual App Experience Feed */}
        <div className="hero-visual-feed">
          
          {/* Card 1: Investment-style Portfolio Preview */}
          <div className="app-card invest-box">
            <div className="feed-card-header flex-between">
              <span>PORTFOLIO: <strong>KAVITA RAO</strong></span>
              <span className="text-light text-small">● LIVE SYNC</span>
            </div>
            
            <div className="portfolio-value">
              <div className="text-muted text-small">Stability Index</div>
              <div className="portfolio-score-wrapper">
                 <span className="score-large">96.4</span>
                 <span className="text-green text-small" style={{ fontWeight: '600' }}>
                   <ArrowUpRight size={18} strokeWidth={3} /> +1.2%
                 </span>
              </div>
            </div>
            
            <div className="stock-list">
              {/* Metric 1 */}
              <div className="stock-row">
                <div className="stock-name">
                  <strong>HRT <span>Heart Rate</span></strong> 
                </div>
                <div className="stock-price text-right">
                  <div>72 bpm <span className="text-green text-small" style={{marginLeft: '8px'}}>+2.1%</span></div>
                </div>
              </div>
              
              {/* Metric 2 */}
              <div className="stock-row">
                <div className="stock-name">
                  <strong>BLDP <span>Blood Pressure</span></strong> 
                </div>
                <div className="stock-price text-right">
                  <div>118/76 <span className="text-muted text-small" style={{marginLeft: '8px'}}>Stable</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Physician Directive */}
          <div className="app-card action-box">
            <div className="card-top-row">
              <span className="info-badge badge-orange">MD DIRECTIVE INCOMING</span>
              <span className="text-muted text-small">Just now</span>
            </div>
            <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '4px' }}>
              Dr. A. Kapoor (Supervising MD)
            </strong>
            <p className="text-muted text-small border-left-quote">
              "Kavita's BP data over the last 48 hours shows slight elevation. I have proactively sent a remote update to her morning dosage schedule directly to the smart dispenser."
            </p>
            <button className="outline-btn-small">Acknowledge Prescription Update</button>
          </div>

          {/* Card 3: Network Diagnostics (Devices & Sensors) */}
          <div className="app-card sensor-box">
            <div className="card-top-row">
              <span className="info-badge badge-black">SYSTEM PING</span>
              <span className="text-green text-small"><strong>100% SECURE</strong></span>
            </div>
            <div className="sensor-list">
               <div className="flex-between text-small border-bottom-light">
                 <span>Hallway Fall Sensor</span> <strong className="text-green">Online</strong>
               </div>
               <div className="flex-between text-small border-bottom-light">
                 <span>Smart Pill Dispenser</span> <strong>Dispensed 9:02 AM</strong>
               </div>
               <div className="flex-between text-small">
                 <span>Nurse Dispatch</span> <strong>Due Friday, 10 AM</strong>
               </div>
            </div>
          </div>

        </div>
      </header>

      {/* 4. LOCATION BAR */}
      <div id="locations" className="locations-bar">
        <div className="container flex-center">
          <MapPin size={20} />
          <span>Currently launching early access in <strong>Bengaluru, Delhi, and Mumbai.</strong></span>
        </div>
      </div>

      {/* 5. PRODUCT USPs Grid */}
      <section id="platform" className="content-section">
        <div className="container">
          <h2 className="section-title">A Complete Medical Safety Net</h2>
          
          <div className="grid-3">
            <div className="flat-card border-top-thick">
              <h3>1. Smart Devices & App</h3>
              <p>Our core strength is in our integrated tech layer. We pair the home with smart wearables and non-intrusive monitors. These devices sync flawlessly with the CareNest App, pushing live daily updates directly to your phone.</p>
            </div>
            
            <div className="flat-card border-top-thick">
              <h3>2. Physician Oversight</h3>
              <p>Doctors are the anchor of this program. A designated medical expert continuously oversees device data and directs nurses—taking full clinical accountability so crises are prevented before they occur.</p>
            </div>

            <div className="flat-card border-top-thick">
              <h3>3. On-Ground Nurses</h3>
              <p>The human touch complements the tech. Hyperlocal nurses conduct frequent physical checks, verifying medication adherence, frailty, and hydration, acting as the exact eyes and ears of the physician.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA / INTENT CAPTURE */}
      <section className="cta-section bg-light">
        <div className="container">
          <h2>Shape the future of elder care.</h2>
          <p>We are officially launching the pilot program at roughly <strong>$100 / month</strong>. Give us your feedback and secure early priority access for your family.</p>
          <button className="primary-btn" onClick={handleOpenModal} disabled={hasSubmitted}>
             {hasSubmitted ? "Waitlist Application Saved ✓" : "Help Us Build (Join Waitlist)"}
          </button>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="footer">
        <div className="container">
           &copy; 2026 CareNest Platform. Built securely to protect your data.
        </div>
      </footer>

      {/* -------------------------------------------------------------
          8. WAITLIST MODAL
          ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Join the Pilot Waitlist</h2>
              <button className="close-btn" onClick={() => !isSubmitting && setIsModalOpen(false)}>×</button>
            </div>
            
            {!hasSubmitted ? (
              <div className="modal-body">
                <p>Anticipated launch pricing is <strong>$100 / month</strong>. No payment is required today.</p>
                
                {/* Dynamically Render Server Errors (e.g., Duplicate Emails, Invalid Requests) */}
                {serverError && <div className="error-banner">{serverError}</div>}

                <form onSubmit={handleFormSubmit} className="flat-form">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formState.name}
                      onChange={e => setFormState({...formState, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={formState.contact}
                      onChange={e => setFormState({...formState, contact: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>What must this platform do for you to trust it with your parents' care?</label>
                    <textarea 
                      required 
                      rows="4" 
                      value={formState.questions}
                      onChange={e => setFormState({...formState, questions: e.target.value})}
                    ></textarea>
                  </div>
                  
                  {/* Lock the button UI while we validate across the server */}
                  <button type="submit" className="primary-btn full-width" disabled={isSubmitting}>
                    {isSubmitting ? "Validating & Processing..." : "Yes, I'm Interested ($100/mo)"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="modal-body success-state">
                <h2>Success.</h2>
                <p>Your interest has been recorded.</p>
                <div className="status-badge">Waitlist Tracker Updated Live.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
