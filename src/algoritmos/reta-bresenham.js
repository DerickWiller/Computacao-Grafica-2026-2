// só usa inteiros, sem divisão
function retaBresenham(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1)
  const dy = Math.abs(y2 - y1)
  const sx = x2 >= x1 ? 1 : -1
  const sy = y2 >= y1 ? 1 : -1
  const pixels = []
  let x = x1
  let y = y1

  if (dx >= dy) {
    let d = 2 * dy - dx
    for (let i = 0; i <= dx; i++) {
      pixels.push({ x, y })
      if (d > 0) {
        y += sy
        d += 2 * (dy - dx)
      } else {
        d += 2 * dy
      }
      x += sx
    }
  } else {
    // mesma ideia com os papéis de x e y trocados
    let d = 2 * dx - dy
    for (let i = 0; i <= dy; i++) {
      pixels.push({ x, y })
      if (d > 0) {
        x += sx
        d += 2 * (dx - dy)
      } else {
        d += 2 * dx
      }
      y += sy
    }
  }

  return pixels
}
