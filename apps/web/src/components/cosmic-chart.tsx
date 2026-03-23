import { useEffect, useRef } from 'react';

interface CosmicChartProps {
  astrologyData: any;
  size?: number;
}

export default function CosmicChart({ astrologyData, size = 400 }: CosmicChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !astrologyData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = (size / 2) - 20;
    const innerRadius = outerRadius - 30;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Set up cosmic styling
    ctx.fillStyle = 'hsl(240, 10%, 3.9%)';
    ctx.fillRect(0, 0, size, size);

    // Draw outer circle (zodiac wheel)
    ctx.strokeStyle = 'hsl(267, 84%, 64%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw zodiac signs around the wheel
    const zodiacSigns = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    ctx.fillStyle = 'hsl(45, 96%, 68%)';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180); // Start from top (Aries)
      const x = centerX + Math.cos(angle) * (outerRadius + 15);
      const y = centerY + Math.sin(angle) * (outerRadius + 15);
      ctx.fillText(zodiacSigns[i], x, y);
    }

    // Draw house lines
    ctx.strokeStyle = 'hsla(267, 84%, 64%, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * outerRadius;
      const y2 = centerY + Math.sin(angle) * outerRadius;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw planetary symbols
    const planetSymbols: { [key: string]: string } = {
      sun: '☉',
      moon: '☽',
      mercury: '☿',
      venus: '♀',
      mars: '♂',
      jupiter: '♃',
      saturn: '♄',
      uranus: '♅',
      neptune: '♆',
      pluto: '♇'
    };

    const zodiacOrder = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

    if (astrologyData.planets) {
      ctx.font = '14px serif';
      ctx.fillStyle = 'hsl(0, 0%, 98%)';
      
      Object.entries(astrologyData.planets).forEach(([planet, data]: [string, any]) => {
        const signIndex = zodiacOrder.indexOf(data.sign.toLowerCase());
        if (signIndex !== -1) {
          // Calculate position based on sign and degree
          const signAngle = signIndex * 30;
          const degreeInSign = data.degree || 15; // Default to middle of sign
          const totalAngle = (signAngle + (degreeInSign / 30) * 30 - 90) * (Math.PI / 180);
          
          const radius = innerRadius + 20;
          const x = centerX + Math.cos(totalAngle) * radius;
          const y = centerY + Math.sin(totalAngle) * radius;
          
          const symbol = planetSymbols[planet] || '●';
          ctx.fillText(symbol, x, y);
        }
      });
    }

    // Draw aspects (simplified - just major aspects)
    if (astrologyData.aspects) {
      ctx.strokeStyle = 'hsla(45, 96%, 68%, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      astrologyData.aspects.forEach((aspect: any) => {
        // This would require more complex calculation in a real chart
        // For now, just draw a few sample aspect lines
        const angle1 = Math.random() * 2 * Math.PI;
        const angle2 = Math.random() * 2 * Math.PI;
        
        const x1 = centerX + Math.cos(angle1) * (innerRadius - 10);
        const y1 = centerY + Math.sin(angle1) * (innerRadius - 10);
        const x2 = centerX + Math.cos(angle2) * (innerRadius - 10);
        const y2 = centerY + Math.sin(angle2) * (innerRadius - 10);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      
      ctx.setLineDash([]);
    }

    // Add mystical glow effect
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius);
    gradient.addColorStop(0, 'hsla(267, 84%, 64%, 0.1)');
    gradient.addColorStop(1, 'hsla(267, 84%, 64%, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

  }, [astrologyData, size]);

  if (!astrologyData) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-lg"
        style={{ width: size, height: size }}
      >
        <p className="text-muted-foreground">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <canvas 
        ref={canvasRef}
        className="rounded-lg mystical-glow"
        style={{ maxWidth: '100%', height: 'auto' }}
        data-testid="cosmic-chart"
      />
    </div>
  );
}
