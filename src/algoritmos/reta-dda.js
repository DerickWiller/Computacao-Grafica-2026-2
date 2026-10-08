function retaDDA(x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const passos = Math.max(Math.abs(dx), Math.abs(dy))

  if (passos === 0) return [{ x: x1, y: y1 }]

  const xInc = dx / passos
  const yInc = dy / passos
  const pixels = []
  let x = x1
  let y = y1

  for (let i = 0; i <= passos; i++) {
    pixels.push({ x: Math.round(x), y: Math.round(y) })
    x += xInc
    y += yInc
  }

  return pixels
}
