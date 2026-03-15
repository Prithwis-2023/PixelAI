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

export default function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const scale = 2; 
    const blockW = 16 * scale;
    
    // Character state
    let kidX = 0;
    let kidVx = 1; // 기본 속도 많이 낮춤 (기존 4)
    let isPaused = false;
    let pauseTimer = 0;

    // Falling Tetris Blocks state
    const TETRIS_SHAPES = [
      [[1, 1, 1, 1]], // I
      [[1, 1], [1, 1]], // O
      [[1, 1, 1], [0, 1, 0]], // T
      [[1, 1, 0], [0, 1, 1]], // Z
      [[0, 1, 1], [1, 1, 0]], // S
      [[1, 0, 0], [1, 1, 1]], // L
      [[0, 0, 1], [1, 1, 1]], // J
    ];

    const TETRIS_COLORS = [
    'rgba(255, 0, 0, 0.6)',     // Vibrant Red
      'rgba(0, 255, 0, 0.6)',     // Vibrant Green
      'rgba(0, 102, 255, 0.6)',   // Vibrant Blue
      'rgba(255, 255, 0, 0.6)',   // Vibrant Yellow
      'rgba(255, 102, 0, 0.6)',   // Vibrant Orange
      'rgba(204, 0, 255, 0.6)',   // Vibrant Purple
      'rgba(0, 255, 255, 0.6)'    // Vibrant Cyan
    ];

    type FallingBlock = {
      x: number;
      y: number;
      shape: number[][];
      color: string;
      speed: number;
      laneX: number;
    };
    
    let fallingBlocks: FallingBlock[] = [];
    const tBlockSize = 24;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      kidX = blockW; // Reset kid position

      fallingBlocks = [];
      const laneWidth = tBlockSize * 5;
      
      // Spawn exactly one or two lanes on the absolute edges of the screen
      // so it elegantly frames the UI regardless of its dynamic width.
      const numLanesEdge = Math.max(1, Math.floor(width * 0.05 / laneWidth)); 
      
      const verticalSpacing = 250; // 원천적으로 겹침을 방지하기 위한 최소 간격
      const blocksPerLane = Math.ceil(height / verticalSpacing) + 1;

      const createLaneBlocks = (numLanes: number, offsetStartX: number) => {
        for (let i = 0; i < numLanes; i++) {
          const laneSpeed = 0.5 + Math.random() * 0.9; 
          let currentY = height + Math.random() * 300; 
          
          let lastColorIndex = -1; // 이전 색상 기억 (연속 중복 방지)

          for (let j = 0; j < blocksPerLane; j++) {
            currentY -= (verticalSpacing + Math.random() * 400); 
            
            // 이전 색상과 다른 색상이 나올 때까지 무한루프
            let newColorIndex;
            do {
              newColorIndex = Math.floor(Math.random() * TETRIS_COLORS.length);
            } while (newColorIndex === lastColorIndex);
            
            lastColorIndex = newColorIndex;

            fallingBlocks.push({
              x: offsetStartX + i * laneWidth + Math.random() * tBlockSize,
              y: currentY,
              shape: TETRIS_SHAPES[Math.floor(Math.random() * TETRIS_SHAPES.length)],
              color: TETRIS_COLORS[newColorIndex],
              speed: laneSpeed,
              laneX: offsetStartX + i * laneWidth
            });
          }
        }
      };

      createLaneBlocks(numLanesEdge, 0); // Spawn on far left
      createLaneBlocks(numLanesEdge, width - (numLanesEdge * laneWidth)); // Spawn on far right
    };

    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // --- 1. Draw slowly falling Tetris blocks ---
      for (let i = fallingBlocks.length - 1; i >= 0; i--) {
        const b = fallingBlocks[i];
        b.y += b.speed;
        
        ctx.fillStyle = b.color;
        for(let r=0; r<b.shape.length; r++) {
          for(let c=0; c<b.shape[r].length; c++) {
            if(b.shape[r][c]) {
              // 구분이 가도록 1px의 내부 간격을 줌
              ctx.fillRect(b.x + c * tBlockSize + 1, b.y + r * tBlockSize + 1, tBlockSize - 2, tBlockSize - 2);
            }
          }
        }

        // 블록이 바닥(그리드)을 지나쳐 완전히 안 보이면 맨 위로 올려 배치
        if (b.y > height) {
          let minY = height;
          for (const other of fallingBlocks) {
            if (other.laneX === b.laneX && other.y < minY) {
              minY = other.y;
            }
          }
          // 최소 간격을 보장하면서 무작위성(위상차)을 추가해 자연스럽게 배치
          b.y = minY - (250 + Math.random() * 400); 
          b.x = b.laneX + Math.random() * tBlockSize;
          b.shape = TETRIS_SHAPES[Math.floor(Math.random() * TETRIS_SHAPES.length)];
          
          // 자신의 바로 아래(원래는 가장 위에 있던 다른 블록) 블록과 색상이 겹치지 않도록 처리
          const newColorIndices: number[] = [];
          for(let colorIdx=0; colorIdx<TETRIS_COLORS.length; colorIdx++) {
            const potentialCol = TETRIS_COLORS[colorIdx];
            let isValid = true;
            for (const other of fallingBlocks) {
               // 최상단 근처 블록들과 비교 (같은 레인 안에서)
               if (other !== b && other.laneX === b.laneX && Math.abs(other.y - b.y) < 2000) {
                 if (other.color === potentialCol) {
                   isValid = false;
                   break;
                 }
               }
            }
            if(isValid) newColorIndices.push(colorIdx);
          }

          if(newColorIndices.length > 0) {
            b.color = TETRIS_COLORS[newColorIndices[Math.floor(Math.random() * newColorIndices.length)]];
          } else {
             // 만약 모든 색이 겹친다면(거의 일어나지 않음) 그냥 랜덤
             b.color = TETRIS_COLORS[Math.floor(Math.random() * TETRIS_COLORS.length)];
          }
        }
      }

      // --- 2. Draw Bottom Floor ---
      for (let x = 0; x < width; x += blockW) {
        drawSprite(ctx, SPRITES.block, x, height - blockW, scale);
      }

      // --- 3. Draw Moving Character ---
      if (isPaused) {
        pauseTimer -= 16; // 대략 60fps 기준 ms 차감
        if (pauseTimer <= 0) {
          isPaused = false;
        }
      } else {
        kidX += kidVx;
        
        // 1.5% 확률로 멈춤 (약 1~3초간)
        if (Math.random() < 0.015) {
          isPaused = true;
          pauseTimer = 1000 + Math.random() * 2000; 
        }

        if (kidX < 0) {
          kidX = 0;
          kidVx = Math.abs(kidVx);
        } else if (kidX > width - blockW) {
          kidX = width - blockW;
          kidVx = -Math.abs(kidVx);
        }
      }

      const kidSprite = kidVx > 0 ? SPRITES.kid : SPRITES.kid_left;
      drawSprite(ctx, kidSprite, kidX, height - blockW - 16 * scale, scale);

      animationFrameId = requestAnimationFrame(tick);
    };
    
    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={S.canvas} />;
}
