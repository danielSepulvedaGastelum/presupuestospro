export const designTokens = {
  color: {
    canvas: '#f4f6f8', surface: '#ffffff', input: '#eef3f5', ink: '#17202a', muted: '#52616b', border: '#71808a',
    brand: '#0f5f5b', accent: '#b45309', success: '#166534', warning: '#9a6700', danger: '#b42318', focus: '#1d4ed8',
  },
  space: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '24px', 6: '32px' },
  font: { body: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
} as const

export function applyDesignTokens(target = document.documentElement) {
  const { color, space, font } = designTokens
  target.style.setProperty('--canvas', color.canvas); target.style.setProperty('--surface', color.surface); target.style.setProperty('--input', color.input)
  target.style.setProperty('--ink', color.ink); target.style.setProperty('--muted', color.muted); target.style.setProperty('--line', color.border)
  target.style.setProperty('--brand', color.brand); target.style.setProperty('--accent', color.accent); target.style.setProperty('--success', color.success)
  target.style.setProperty('--warning', color.warning); target.style.setProperty('--danger', color.danger); target.style.setProperty('--focus', color.focus)
  target.style.setProperty('--font-body', font.body)
  Object.entries(space).forEach(([key, value]) => target.style.setProperty(`--space-${key}`, value))
}
