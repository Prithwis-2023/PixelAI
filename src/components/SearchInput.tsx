import { SCP } from '../constants';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E2FF3B" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="7.5"/>
    <line x1="21" y1="21" x2="16.5" y2="16.5"/>
  </svg>
);

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** 태그 입력 검색창 + 노란 돋보기 아이콘 */
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
        <SearchIcon />
      </span>
    </div>
  );
}
