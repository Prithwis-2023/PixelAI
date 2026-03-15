import { useRef } from 'react';
import { S } from '../styles/RecBox.styles';

interface RecBoxProps {
  fileName?: string;
  fileSizeMB?: number;
  onReset?: () => void;
  onFileSelect?: (file: File) => void;
}

/** [REC] box — click to select video file + RESET_IDENTIFICATION button */
export default function RecBox({
  fileName,
  fileSizeMB,
  onReset,
  onFileSelect,
}: RecBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = fileName ?? 'INPUT_VIDEO.MP4';
  const displaySize = fileSizeMB != null ? fileSizeMB.toFixed(2) : '—';
  const hasFile = Boolean(fileName);

  const handleClick = () => {
    if (onFileSelect) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
      // reset input so same file can be re-selected
      e.target.value = '';
    }
  };

  return (
    <div
      className={S.containerWrapper}
      style={{
        ...S.containerStyle,
        cursor: onFileSelect ? 'pointer' : 'default',
      }}
      onClick={handleClick}
      title={onFileSelect ? 'Click to select a video file' : undefined}
    >
      {/* Hidden video file input */}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleChange}
        onClick={e => e.stopPropagation()}
      />

      <span
        className={S.recText}
        style={{
          ...S.recTextStyle,
          color: hasFile ? '#ff3333' : '#ff6666',
        }}
      >
        [REC]
      </span>

      <div className={S.infoBlock}>
        <p className={S.fileName} style={S.fileNameStyle}>
          IDENTIFIED: {displayName}
        </p>
        <p className={S.fileSize} style={S.fileSizeStyle}>
          SIZE: {displaySize}MB
        </p>
        {!hasFile && (
          <p style={{ fontSize: '9px', color: '#666', marginTop: '2px', fontFamily: 'inherit' }}>
            CLICK TO SELECT VIDEO
          </p>
        )}
      </div>

      <button
        onClick={e => { e.stopPropagation(); onReset?.(); }}
        className={S.resetBtn}
        style={S.resetBtnStyle}
      >
        // RESET_IDENTIFICATION
      </button>
    </div>
  );
}
