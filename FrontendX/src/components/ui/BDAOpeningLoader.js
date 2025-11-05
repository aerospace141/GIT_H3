const BDAOpeningLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Show logo after brief delay
    setTimeout(() => setShowLogo(true), 300);

    // Start fade out
    setTimeout(() => setFadeOut(true), 2500);

    // Complete and remove
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`bda-opening-loader ${fadeOut ? 'bda-fade-out' : ''}`}>
      <div className={`bda-logo-container ${showLogo ? 'bda-logo-visible' : ''}`}>
        <img 
          src={bdaLogo} 
          alt="BDA Abacus Classes" 
          className="bda-opening-logo"
        />
        <div className="bda-brand-name">BDA Abacus Classes</div>
        <div className="bda-tagline">Where Champions Are Made</div>
      </div>
      
      <div className="bda-progress-container">
        <div className="bda-progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <style>{`
        .bda-opening-loader {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: bda-bg-shift 3s ease infinite;
        }

        @keyframes bda-bg-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .bda-opening-loader.bda-fade-out {
          animation: bda-fadeOut 0.5s ease forwards;
        }

        @keyframes bda-fadeOut {
          to {
            opacity: 0;
            transform: scale(1.1);
          }
        }

        .bda-logo-container {
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-align: center;
        }

        .bda-logo-container.bda-logo-visible {
          opacity: 1;
          transform: scale(1);
        }

        .bda-opening-logo {
          width: 180px;
          height: 180px;
          object-fit: contain;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
          animation: bda-pulse 2s ease-in-out infinite;
        }

        @keyframes bda-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .bda-brand-name {
          font-size: 2.5rem;
          font-weight: 900;
          color: white;
          margin-top: 2rem;
          letter-spacing: 2px;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          animation: bda-glow 2s ease-in-out infinite;
        }

        @keyframes bda-glow {
          0%, 100% { text-shadow: 0 4px 20px rgba(255, 255, 255, 0.3); }
          50% { text-shadow: 0 4px 30px rgba(255, 255, 255, 0.6); }
        }

        .bda-tagline {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
          margin-top: 0.5rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .bda-progress-container {
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .bda-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #60a5fa, #a78bfa, #ec4899);
          border-radius: 10px;
          transition: width 0.3s ease;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.8);
        }

        @media (max-width: 640px) {
          .bda-opening-logo {
            width: 140px;
            height: 140px;
          }

          .bda-brand-name {
            font-size: 1.8rem;
            margin-top: 1.5rem;
          }

          .bda-tagline {
            font-size: 0.85rem;
          }

          .bda-progress-container {
            width: 80%;
            max-width: 300px;
            bottom: 40px;
          }
        }
      `}</style>
    </div>
  );
};
export default BDAOpeningLoader;