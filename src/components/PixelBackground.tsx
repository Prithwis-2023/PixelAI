import { useEffect, useRef } from 'react';
import { S } from '../styles/PixelBackground.styles';

const COLOR_MINT = '#2DEBA9';
const COLOR_MINT_DIM = 'rgba(45, 235, 169, 0.2)';

const baseSprites = {
  kid: [
    "......1111......",
    ".....111111.....",
    ".....111001.....",
    ".....111111.....",
    "......1111......",
    "...1111111111...",
    "..111111111111..",
    "..111.1111.111..",
    "..11..1111..11..",
    ".11...1111...11.",
    ".11...1111...11.",
    "......1111......",
    "......1..1......",
    ".....11..11.....",
    ".....11..11.....",
    "....111..111...."
  ],
  spike: [
    ".......11.......",
    "......1111......",
    ".....110011.....",
    "....11000011....",
    "...1100000011...",
    "..110000000011..",
    ".11111111111111.",
    "1111111111111111"
  ],
  spike_down: [
    "1111111111111111",
    ".11111111111111.",
    "..110000000011..",
    "...1100000011...",
    "....11000011....",
    ".....110011.....",
    "......1111......",
    ".......11......."
  ],
  cherry: [
    ".......1........",
    "......11........",
    ".....1.1........",
    "...11..1..11....",
    "..101.....101...",
    ".10001...10001..",
    ".10001...10001..",
    "..111.....111..."
  ],
  block: [
    "1111111111111111",
    "1000000100000001",
    "1000000100000001",
    "1111111111111111",
    "1000100000010001",
    "1000100000010001",
    "1111111111111111",
    "1000000100000001",
    "1000000100000001",
    "1111111111111111"
  ]
};

const SPRITES = {
  ...baseSprites,
  kid_left: baseSprites.kid.map(row => row.split('').reverse().join(''))
};

type Entity = {
  type: keyof typeof SPRITES;
  x: number;
  y: number;
  baseY?: number;
};

function drawSprite(ctx: CanvasRenderingContext2D, sprite: string[], x: number, y: number, scale: number) {
  for(let r=0; r<sprite.length; r++){
    for(let c=0; c<sprite[r].length; c++){
      if(sprite[r][c] === '1') {
        ctx.fillStyle = COLOR_MINT;
        ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
      } else if(sprite[r][c] === '0') {
        ctx.fillStyle = COLOR_MINT_DIM;
        ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
      }
    }
  }
}

/** 8-bit 스타일의 레트로 테두리 배경 (IWBTG / 마리오 감성) - 중앙 비우기 */
export default function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const scale = 2; // 1픽셀을 2x2 사이즈로
    const blockW = 16 * scale;

    let elements: Entity[] = [];

    const generateScene = () => {
      elements = [];
      const MAX_CONTENT_WIDTH = 960;
      const marginX = Math.max(0, (width - MAX_CONTENT_WIDTH) / 2);

      // 바닥 및 천장
      for(let x = 0; x < width; x += blockW) {
        elements.push({ type: 'block', x, y: height - blockW });
        elements.push({ type: 'block', x, y: 0 });

        // 중앙(메인 컨텐츠 영역) 밖인 경우에만 가시 추가
        if (x < marginX - blockW || x > width - marginX) {
          if (Math.random() < 0.25) {
            elements.push({ type: 'spike', x, y: height - blockW - 8 * scale });
          }
          if (Math.random() < 0.15) {
            elements.push({ type: 'spike_down', x, y: blockW });
          }
        }
      }

      // 좌우 테두리에 떠있는 플랫폼과 오브젝트들 배치
      if (marginX > blockW * 4) {
        const numPlatforms = Math.floor(height / 140);
        for(let i=0; i<numPlatforms; i++) {
          // 좌측 플랫폼
          let px1 = blockW + Math.random() * (marginX - blockW * 5);
          let py1 = blockW * 3 + Math.random() * (height - blockW * 6);
          for(let b=0; b<3; b++) elements.push({ type: 'block', x: px1 + b * blockW, y: py1 });
          
          if(Math.random() > 0.4) elements.push({ type: 'cherry', x: px1 + blockW, y: py1 - 10 * scale, baseY: py1 - 10 * scale });
          else if(Math.random() > 0.5) elements.push({ type: 'spike', x: px1 + blockW, y: py1 - 8 * scale });
          else elements.push({ type: 'kid', x: px1 + blockW, y: py1 - 16 * scale });

          // 우측 플랫폼
          let px2 = width - marginX + blockW + Math.random() * (marginX - blockW * 5);
          let py2 = blockW * 3 + Math.random() * (height - blockW * 6);
          for(let b=0; b<3; b++) elements.push({ type: 'block', x: px2 + b * blockW, y: py2 });
          
          if(Math.random() > 0.4) elements.push({ type: 'cherry', x: px2 + blockW, y: py2 - 10 * scale, baseY: py2 - 10 * scale });
          else if(Math.random() > 0.5) elements.push({ type: 'spike', x: px2 + blockW, y: py2 - 8 * scale });
          else elements.push({ type: 'kid_left', x: px2 + blockW, y: py2 - 16 * scale });
        }
      }

      // 바닥에 주인공들 랜덤 배치
      if (marginX > blockW * 3) {
        elements.push({ type: 'kid', x: blockW * 2, y: height - blockW - 16 * scale });
        elements.push({ type: 'kid_left', x: width - blockW * 4, y: height - blockW - 16 * scale });
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      generateScene();
    };

    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;
    let time = 0;

    const tick = () => {
      time += 0.05;
      ctx.clearRect(0, 0, width, height);

      for(const el of elements) {
        let drawY = el.y;
        // 체리는 공중에 둥둥 떠다니는 애니메이션
        if (el.type === 'cherry' && el.baseY !== undefined) {
          drawY = el.baseY + Math.sin(time + el.x) * 4;
        }
        drawSprite(ctx, SPRITES[el.type], el.x, drawY, scale);
      }

      animationFrameId = requestAnimationFrame(tick);
    };
    
    tick();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={S.canvas} />;
}
