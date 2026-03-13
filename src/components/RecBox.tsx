import { S } from '../styles/RecBox.styles';

interface RecBoxProps {
  fileName?: string;
  fileSizeMB?: number;
  onReset?: () => void;
}

/** [REC] 박스 — 파일 정보 표시 + RESET_IDENTIFICATION 버튼 */
export default function RecBox({ fileName = 'INPUT_VIDEO.MP4', fileSizeMB = 1.33, onReset }: RecBoxProps) {
  return (
    <div className={S.containerWrapper} style={S.containerStyle}>
      <span className={S.recText} style={S.recTextStyle}>
        [REC]
      </span>

      <div className={S.infoBlock}>
        <p className={S.fileName} style={S.fileNameStyle}>
          IDENTIFIED: {fileName}
        </p>
        <p className={S.fileSize} style={S.fileSizeStyle}>
          SIZE: {fileSizeMB.toFixed(2)}MB
        </p>
      </div>

      <button
        onClick={onReset}
        className={S.resetBtn}
        style={S.resetBtnStyle}
      >
        // RESET_IDENTIFICATION
      </button>
    </div>
  );
}
