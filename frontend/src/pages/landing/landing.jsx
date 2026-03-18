import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowRight,
  Users,
  Clock,
  CheckCircle2,
  Search,
  Handshake,
  ShieldAlert,
  Award,
} from 'lucide-react';
import wildVaultLogo from '../../components/WildVault Logo.svg';
import './landing.css';

export function LandingPage({ onGetStarted }) {
  const howItWorksRef = useRef(null);
  const protocolRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const steps = [
    {
      step: '01',
      title: 'Authenticate',
      desc: 'Securely login using your institutional credentials to enter the community.',
      icon: <Users />,
    },
    {
      step: '02',
      title: 'Locate Gear',
      desc: 'Browse the central vault for calculators, PE uniforms, or technical tools.',
      icon: <Search />,
    },
    {
      step: '03',
      title: 'Coordinate',
      desc: 'Send a request to the item owner and coordinate a safe hand-off on campus.',
      icon: <Handshake />,
    },
    {
      step: '04',
      title: 'Return',
      desc: 'Use the asset for your project and return it by the registry deadline.',
      icon: <Clock />,
    },
  ];

  const protocols = [
    {
      title: 'Identity Verification',
      desc: 'Only students with @uni.edu emails can participate.',
      icon: <ShieldAlert />,
    },
    {
      title: 'Condition Logging',
      desc: 'Photos and notes are taken before and after every loan.',
      icon: <CheckCircle2 />,
    },
    {
      title: 'Integrity Scoring',
      desc: 'Users build trust scores based on successful exchanges.',
      icon: <Award />,
    },
  ];

  return (
    <div className="landing-page">
      <div className="background-texture" />

      <nav>
        <div className="nav-brand">
          <img src={wildVaultLogo} alt="WildVault logo" className="nav-brand-logo" />
          <span className="nav-brand-text">
            WILD<span className="nav-brand-accent">VAULT</span>
          </span>
        </div>
        <div className="nav-container">
          <button
            onClick={() => scrollToSection(howItWorksRef)}
            className="nav-button"
          >
            How it works
          </button>
          <button
            onClick={() => scrollToSection(protocolRef)}
            className="nav-button"
          >
            Protocol
          </button>
          <button onClick={onGetStarted} className="nav-login-btn">
            Login
          </button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Equip <br />
            <span className="hero-title-highlight">The Mission.</span>
          </h1>

          <p className="hero-description">
            WildVault is the secure gateway for university equipment sharing. From
            engineering tools to athletic wear, borrow exactly what you need from the
            community vault.
          </p>

          <div className="hero-buttons">
            <button onClick={onGetStarted} className="hero-cta-btn">
              Enter the Vault
              <ArrowRight className="hero-arrow" />
            </button>
          </div>

          <div className="hero-social">
            <div className="social-avatars">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="avatar">
                  <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                </div>
              ))}
            </div>
            <p className="social-text">
              Join <span className="social-count">12,000+</span> verified students
            </p>
          </div>
        </div>

        <div className="hero-image-container">
          <div className="hero-image-glow" />
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1758521541622-d1e6be8c39bb?auto=format&fit=crop&q=80&w=1080"
              alt="Student using WildVault"
            />
            <div className="hero-image-overlay" />
          </div>
        </div>
      </section>

      <section ref={howItWorksRef} className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="how-it-works-header">
            <p className="how-it-works-label">The Exchange Process</p>
            <h2 className="how-it-works-title">How it Works</h2>
          </div>

          <div className="steps-grid">
            {steps.map((item) => (
              <div key={item.step} className="step-item">
                <div className="step-icon-box">
                  {React.cloneElement(item.icon, {
                    className: 'step-icon',
                    strokeWidth: 2.5,
                  })}
                </div>
                <div className="step-content">
                  <div className="step-header">
                    <span className="step-number">{item.step}</span>
                    <h3 className="step-title">{item.title}</h3>
                  </div>
                  <p className="step-description">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={protocolRef} className="protocol-section">
        <div className="protocol-grid">
          <div className="protocol-image-container">
            <div className="protocol-image-glow" />
            <div className="protocol-image">
              <img
                src="https://images.unsplash.com/photo-1763025747123-bb3a2e3a5ac3?auto=format&fit=crop&q=80&w=1080"
                alt="Vault Equipment"
              />
            </div>
          </div>

          <div className="protocol-content">
            <div className="protocol-header">
              <p className="protocol-label">Vault Standards</p>
              <h2 className="protocol-title">
                Institutional <br /> Protocol
              </h2>
              <p className="protocol-description">
                WildVault operates under strict university community guidelines.
                Every exchange is logged, tracked, and insured through our
                peer-to-peer trust system.
              </p>
            </div>

            <div className="protocol-features">
              {protocols.map((item) => (
                <div key={item.title} className="protocol-feature">
                  <div className="protocol-feature-icon">{item.icon}</div>
                  <div className="protocol-feature-content">
                    <h4 className="protocol-feature-title">{item.title}</h4>
                    <p className="protocol-feature-description">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="quote-section">
        <div className="quote-texture" />
        <div className="quote-container">
          <div className="quote-stars">
            {[1, 2, 3, 4, 5].map((i) => (
              <Award key={i} className="quote-star" />
            ))}
          </div>

          <h3 className="quote-text">
            "The Vault saved my final thesis project. I needed a T-Square and a TI-84
            at 2 AM, and a peer in my dorm had them listed."
          </h3>

          <div>
            <p className="quote-author">Sarah J. Miller</p>
            <p className="quote-title">Architecture Junior • 48 Successful Trades</p>
          </div>
        </div>
      </section>

      <section className="cta-footer-section">
        <div className="cta-footer-container">
          <h2 className="cta-final-title">
            Ready to <br /> Explore?
          </h2>
          <button onClick={onGetStarted} className="cta-final-btn">
            Access the Vault Now
          </button>

          <div className="footer-divider">
            <div className="footer-brand" aria-label="WildVault">
              <img src={wildVaultLogo} alt="WildVault logo" className="footer-brand-logo" />
              <span className="footer-brand-text">
                WILD<span className="footer-brand-accent">VAULT</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

LandingPage.propTypes = {
  onGetStarted: PropTypes.func.isRequired,
};
