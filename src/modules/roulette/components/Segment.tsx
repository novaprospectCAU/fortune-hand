/**
 * Segment component - Individual roulette wheel segment
 */

import type { RouletteSegment } from '@/types/interfaces';

interface SegmentProps {
  segment: RouletteSegment;
  startAngle: number;
  sweepAngle: number;
  radius: number;
  centerX: number;
  centerY: number;
  isHighlighted?: boolean;
  /** Preview highlight from Fortune Teller joker */
  isPreview?: boolean;
}

/**
 * Converts degrees to radians
 */
function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates the SVG arc path for a segment
 */
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  // Convert angles from degrees to radians
  // Adjust by -90 degrees so 0 degrees is at the top
  const startRad = degToRad(startAngle - 90);
  const endRad = degToRad(endAngle - 90);

  const startX = cx + radius * Math.cos(startRad);
  const startY = cy + radius * Math.sin(startRad);
  const endX = cx + radius * Math.cos(endRad);
  const endY = cy + radius * Math.sin(endRad);

  // Large arc flag: 1 if angle > 180, 0 otherwise
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  // Create SVG path
  return [
    'M',
    cx,
    cy, // Move to center
    'L',
    startX,
    startY, // Line to start of arc
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    1,
    endX,
    endY, // Arc to end
    'Z', // Close path back to center
  ].join(' ');
}

/**
 * Calculates the position for the label text
 */
function getLabelPosition(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  sweepAngle: number
): { x: number; y: number; rotation: number } {
  // Place label at the middle of the segment, at 2/3 radius
  const midAngle = startAngle + sweepAngle / 2;
  const labelRadius = radius * 0.65;
  const rad = degToRad(midAngle - 90);

  return {
    x: cx + labelRadius * Math.cos(rad),
    y: cy + labelRadius * Math.sin(rad),
    rotation: midAngle,
  };
}

/**
 * Renders an individual segment of the roulette wheel.
 */
export function Segment({
  segment,
  startAngle,
  sweepAngle,
  radius,
  centerX,
  centerY,
  isHighlighted = false,
  isPreview = false,
}: SegmentProps) {
  const path = describeArc(
    centerX,
    centerY,
    radius,
    startAngle,
    startAngle + sweepAngle
  );

  const labelPos = getLabelPosition(
    centerX,
    centerY,
    radius,
    startAngle,
    sweepAngle
  );

  // Display text: show multiplier or "BUST" for 0x
  const displayText =
    segment.multiplier === 0 ? 'X' : `${segment.multiplier}x`;

  // Determine text color based on background brightness
  const isLightColor = isColorLight(segment.color);
  const textColor = isLightColor ? '#000000' : '#ffffff';

  // Calculate font size based on segment size
  const fontSize = Math.max(10, Math.min(20, sweepAngle / 3));

  // Determine stroke and filter based on state
  const getStroke = () => {
    if (isPreview) return '#a855f7'; // Purple for Fortune Teller preview
    if (isHighlighted) return '#ffffff';
    return '#1f2937';
  };

  const getStrokeWidth = () => {
    if (isPreview) return 4;
    if (isHighlighted) return 3;
    return 1;
  };

  const getFilter = () => {
    if (isPreview) {
      return 'brightness(1.1) drop-shadow(0 0 12px rgba(168, 85, 247, 0.8))';
    }
    if (isHighlighted) {
      return 'brightness(1.2) drop-shadow(0 0 8px rgba(255,255,255,0.5))';
    }
    return 'none';
  };

  return (
    <g className="roulette-segment">
      <path
        d={path}
        fill={segment.color}
        stroke={getStroke()}
        strokeWidth={getStrokeWidth()}
        className="transition-all duration-200"
        style={{
          filter: getFilter(),
        }}
      />
      {/* Fortune Teller preview indicator - eye icon */}
      {isPreview && (
        <text
          x={labelPos.x}
          y={labelPos.y - fontSize * 0.8}
          fill="#a855f7"
          fontSize={fontSize * 0.6}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${labelPos.rotation}, ${labelPos.x}, ${labelPos.y - fontSize * 0.8})`}
        >
          👁️
        </text>
      )}
      <text
        x={labelPos.x}
        y={labelPos.y}
        fill={textColor}
        fontSize={fontSize}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(${labelPos.rotation}, ${labelPos.x}, ${labelPos.y})`}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {displayText}
      </text>
    </g>
  );
}

/**
 * Determines if a hex color is light (for contrast calculation)
 */
function isColorLight(color: string): boolean {
  // Remove # if present
  const hex = color.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
}

export default Segment;
