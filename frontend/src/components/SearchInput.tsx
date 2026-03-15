import { useState } from 'react';
import { S } from '../styles/SearchInput.styles';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
}

/** 태그 입력창 — 해시태그 버튼 클릭 or Enter로 태그 확정 */
export default function SearchInput({ value, onChange, onSubmit, placeholder = 'Enter keyword...' }: SearchInputProps) {
  const [pressed, setPressed] = useState(false);

  const handleSubmit = () => {
    onSubmit?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className={S.container}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={S.input}
        style={S.inputStyle}
      />

      {/* 해시태그 버튼 — 클릭 가능, 누르는 피드백 있음 */}
      <button
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onClick={handleSubmit}
        style={S.buttonStyle(pressed)}
        title="태그 입력 확정"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={S.svgStroke(pressed)}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={S.svgStyle}
        >
          <line x1="4" y1="9" x2="20" y2="9"/>
          <line x1="4" y1="15" x2="20" y2="15"/>
          <line x1="10" y1="3" x2="8" y2="21"/>
          <line x1="16" y1="3" x2="14" y2="21"/>
        </svg>
      </button>
    </div>
  );
}
