// Usa a equação y = m*x + b e arredonda o resultado para o pixel mais próximo.
function retaAnalitica(x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const pixels = []

  if (dx === 0 && dy === 0) return [{ x: x1, y: y1 }]

  if (Math.abs(dx) >= Math.abs(dy)) {
    const m = dy / dx
    const b = y1 - m * x1
    const passo = dx > 0 ? 1 : -1
    for (let x = x1; x !== x2 + passo; x += passo) {
      pixels.push({ x, y: Math.round(m * x + b) })
    }
  } else {
    // reta mais vertical: percorre y e calcula x, senão ficam buracos
    const m = dx / dy
    const b = x1 - m * y1
    const passo = dy > 0 ? 1 : -1
    for (let y = y1; y !== y2 + passo; y += passo) {
      pixels.push({ x: Math.round(m * y + b), y })
    }
  }

  return pixels
}
