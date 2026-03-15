import { S } from '../styles/StatsDisplay.styles';

export default function StatsDisplay() {
  return (
    <div className={S.mainContainer}>
      <p style={S.mainTitle}>
        // AWAITING_PIPELINE_INITIALIZATION
      </p>

      <div className={S.pipelineWrapper}>
        
        {/* Node 1 */}
        <div className={S.nodeContainer}>
          <div className={S.cornerTL} />
          <div className={S.cornerTR} />
          <div className={S.cornerBL} />
          <div className={S.cornerBR} />
          <div className={S.nodeIconWrapper}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <rect x="2" y="2" width="20" height="20" rx="0" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          </div>
          <h3 style={S.nodeTitle}>1. UPLOAD & EXTRACT</h3>
          <p style={S.nodeDesc}>AWS Nova AI extracts raw<br/>video frames perfectly.</p>
        </div>

        {/* Connector */}
        <div className={`${S.connectorH}`} />
        <div className={`${S.connectorV}`} />

        {/* Node 2 */}
        <div className={S.nodeContainer}>
          <div className={S.cornerTL} />
          <div className={S.cornerTR} />
          <div className={S.cornerBL} />
          <div className={S.cornerBR} />
          <div className={S.nodeIconWrapper}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h3 style={S.nodeTitle}>2. YOLO AUTO-LABEL</h3>
          <p style={S.nodeDesc}>Generates bounding box<br/>ground-truth automatically.</p>
        </div>

        {/* Connector */}
        <div className={`${S.connectorH}`} />
        <div className={`${S.connectorV}`} />

        {/* Node 3 */}
        <div className={S.nodeContainer}>
          <div className={S.cornerTL} />
          <div className={S.cornerTR} />
          <div className={S.cornerBL} />
          <div className={S.cornerBR} />
          <div className={S.nodeIconWrapper}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h3 style={S.nodeTitle}>3. CNN TRAINING</h3>
          <p style={S.nodeDesc}>PyTorch trains a lightweight<br/>model on the dataset.</p>
        </div>

      </div>

      {/* Decorative pulse dots */}
      <div className={S.particlesContainer}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <div key={i} className="animate-pulse" style={S.particle(delay)} />
        ))}
      </div>
    </div>
  );
}
