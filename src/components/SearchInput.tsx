import { useState } from 'react';
import { SCP } from '../constants';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
}

/** 태그 입력창 — 해시태그 버튼 클릭 or Enter로 태그 확정 */
export default function SearchInput({ value, onChange, onSubmit, placeholder = '' }: SearchInputProps) {
  const [pressed, setPressed] = useState(false);

  const handleSubmit = () => {
    onSubmit?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="relative shrink-0">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-black outline-none pixel-input"
        style={{
          border: '1px solid rgba(255,255,255,0.5)',
          padding: '10px 40px 10px 16px',
          color: '#E2FF3B',
          fontSize: '13px',
          fontFamily: SCP,
          transition: 'border-color 0.15s ease',
        }}
      />

      {/* 해시태그 버튼 — 클릭 가능, 누르는 피드백 있음 */}
      <button
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onClick={handleSubmit}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: `translateY(-50%) scale(${pressed ? 0.82 : 1})`,
          background: pressed ? '#E2FF3B' : 'transparent',
          border: 'none',
          borderRadius: '2px',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.1s ease, transform 0.08s ease, box-shadow 0.1s ease',
          boxShadow: pressed ? '0 0 8px #E2FF3B99' : 'none',
        }}
        title="태그 입력 확정"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={pressed ? '#000' : '#E2FF3B'}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.1s ease' }}
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
