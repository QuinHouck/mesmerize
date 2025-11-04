/**
 * Shared styles for map components
 * These styles are used across all continent map components
 * Note: These are plain objects for SVG elements, not React Native StyleSheet
 */
export const mapStyles = {
  country: {
    strokeWidth: '0.5px',
    strokeLinecap: 'round' as const,
    stroke: '#222222',
    fill: 'white',
  },
  selected: {
    strokeWidth: '0.5px',
    strokeLinecap: 'round' as const,
    stroke: '#222222',
    fill: '#F9D949',
  },
} as const;

