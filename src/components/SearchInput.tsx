import { SCP } from '../constants';

const HashtagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E2FF3B" strokeWidth="2.5" strokeLinecap="round">
    <line x1="4" y1="9" x2="20" y2="9"/>
    <line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/>
    <line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** 태그 입력창 + 해시태그 아이콘 */
export default function SearchInput({ value, onChange, placeholder = '' }: SearchInputProps) {
  return (
    <div className="relative shrink-0">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
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
      <span className="absolute right-3 top-1/2 -translate-y-1/2">
        <HashtagIcon />
      </span>
    </div>
  );
}

