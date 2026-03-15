

import { S } from '../styles/DatasetBox.styles';

interface DatasetBoxProps {
  onExtract?: () => void;
  disabled?: boolean;
}

/** AI 학습 번들 정보 + EXTRACT_DATASET.ZIP 버튼 */
export default function DatasetBox({ onExtract, disabled = false }: DatasetBoxProps) {
  return (
    <div className={S.container} style={S.containerStyle}>
      {/* 8-bit decorative corners */}
      <div className={S.cornerTopLeft} />
      <div className={S.cornerTopRight} />
      <div className={S.cornerBottomLeft} />
      <div className={S.cornerBottomRight} />

      <div>
        <p style={S.titleStyle}>
          AI _TRAINING_BUNDLE_GENERIC
        </p>
        <p style={S.subtitleStyle}>
          FORMAT: YOLOV8// READY FOR OPTIMIZATION
        </p>
      </div>

      {/* EXTRACT 버튼 + 글리치 장식 */}
      <div className={S.btnWrapper} style={S.btnWrapperStyle}>
        <div className="absolute" style={S.glitchTopLeft} />
        <div className="absolute" style={S.glitchBottomRight} />
        <div className="absolute" style={S.glitchRight} />
        <button
          className={S.button}
          onClick={onExtract}
          disabled={disabled}
          style={S.buttonStyle(disabled)}
        >
          EXTRACT_DATASET.ZIP
        </button>
      </div>
    </div>
  );
}
