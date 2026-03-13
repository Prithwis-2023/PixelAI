import { SCP } from '../constants';

export const S = {
  container: "relative shrink-0",
  input: "w-full bg-black outline-none pixel-input",
  inputStyle: {
    border: '1px solid rgba(255,255,255,0.5)',
    padding: '10px 40px 10px 16px',
    color: '#2DEBA9',
    fontSize: '13px',
    fontFamily: SCP,
    transition: 'border-color 0.15s ease',
  },
  buttonStyle: (pressed: boolean) => ({
    position: 'absolute' as const,
    right: '8px',
    top: '50%',
    transform: `translateY(-50%) scale(${pressed ? 0.82 : 1})`,
    background: pressed ? '#2DEBA9' : 'transparent',
    border: 'none',
    borderRadius: '2px',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.1s ease, transform 0.08s ease, box-shadow 0.1s ease',
    boxShadow: pressed ? '0 0 8px rgba(45,235,169,0.6)' : 'none',
  }),
  svgStroke: (pressed: boolean) => (pressed ? '#000' : '#2DEBA9'),
  svgStyle: { transition: 'stroke 0.1s ease' }
};
