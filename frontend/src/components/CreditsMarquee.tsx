import { SCP } from '../constants';

export default function CreditsMarquee() {
  const creditsText = "// CONTRIBUTORS // FRONTEND: Lee Sumin, Chin Min Kwan // DATABASE & AUTH: Kim Dongryul // BACKEND: Choi Hyung Chan, Prithwis Das //";
  
  return (
    <div 
      style={{
        width: '100%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        backgroundColor: 'rgba(45, 235, 169, 0.05)',
        borderTop: '1px solid rgba(45, 235, 169, 0.2)',
        borderBottom: '1px solid rgba(45, 235, 169, 0.2)',
        padding: '8px 0',
        minHeight: '26px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div 
        style={{
          display: 'flex',
          fontFamily: SCP,
          fontSize: '10px',
          fontWeight: 700,
          lineHeight: '1',
          color: '#2DEBA9',
          letterSpacing: '0.15em',
          animation: 'marquee 25s linear infinite'
        }}
      >
        <span style={{ paddingRight: '40px' }}>{creditsText}</span>
        <span style={{ paddingRight: '40px' }}>{creditsText}</span>
        <span style={{ paddingRight: '40px' }}>{creditsText}</span>
        <span style={{ paddingRight: '40px' }}>{creditsText}</span>
      </div>
      
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
}
