const LIVRE = 0
const BORDA = 1
const VISITADO = 2

function preenchimentoBoundaryFill(vertices) {
  const borda = contornoPoligono(vertices)
  // 1 pixel de folga em volta: se o preenchimento chegar nela, vazou para fora
  const xMin = Math.min(...vertices.map((v) => v.x)) - 1
  const xMax = Math.max(...vertices.map((v) => v.x)) + 1
  const yMin = Math.min(...vertices.map((v) => v.y)) - 1
  const yMax = Math.max(...vertices.map((v) => v.y)) + 1
  const largura = xMax - xMin + 1
  const mapa = new Uint8Array(largura * (yMax - yMin + 1))
  const indice = (x, y) => (y - yMin) * largura + (x - xMin)

  for (const p of borda) mapa[indice(p.x, p.y)] = BORDA

  const pixels = []

  // 4 vizinhos, com 8 passaria pela diagonal da borda
  function boundaryFill(x0, y0) {
    const regiao = []
    let vazou = false
    const pilha = [[x0, y0]]

    while (pilha.length) {
      const [x, y] = pilha.pop()
      if (x < xMin || x > xMax || y < yMin || y > yMax) continue
      const i = indice(x, y)
      if (mapa[i] !== LIVRE) continue
      mapa[i] = VISITADO
      if (x === xMin || x === xMax || y === yMin || y === yMax) vazou = true
      regiao.push({ x, y })
      pilha.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    if (!vazou) pixels.push(...regiao)
  }

  // polígono côncavo pode ter mais de uma região, então procura semente em todas
  for (let y = yMin + 1; y < yMax; y++) {
    for (let x = xMin + 1; x < xMax; x++) {
      if (mapa[indice(x, y)] === LIVRE && dentroDoPoligono(vertices, x, y)) boundaryFill(x, y)
    }
  }

  return pixels
}
