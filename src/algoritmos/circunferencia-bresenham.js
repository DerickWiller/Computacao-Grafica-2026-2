// gera um octante e espelha nos outros sete
function circunferenciaBresenham(xc, yc, r) {
  const pixels = []
  let x = 0
  let y = r
  let d = 3 - 2 * r

  while (x <= y) {
    simetria(pixels, xc, yc, x, y)
    if (d < 0) {
      d += 4 * x + 6
    } else {
      d += 4 * (x - y) + 10
      y--
    }
    x++
  }

  return pixels
}

function simetria(pixels, xc, yc, x, y) {
  pixels.push(
    { x: xc + x, y: yc + y },
    { x: xc + y, y: yc + x },
    { x: xc + y, y: yc - x },
    { x: xc + x, y: yc - y },
    { x: xc - x, y: yc - y },
    { x: xc - y, y: yc - x },
    { x: xc - y, y: yc + x },
    { x: xc - x, y: yc + y },
  )
}
