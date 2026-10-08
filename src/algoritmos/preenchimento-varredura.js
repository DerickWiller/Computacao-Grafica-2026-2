// tabela de arestas + lista de arestas ativas
function preenchimentoVarredura(vertices) {
  const tabela = new Map()
  let yMin = Infinity
  let yMax = -Infinity

  vertices.forEach((a, i) => {
    const b = vertices[(i + 1) % vertices.length]
    if (a.y === b.y) return
    const [baixo, cima] = a.y < b.y ? [a, b] : [b, a]
    const aresta = { yMax: cima.y, x: baixo.x, passo: (cima.x - baixo.x) / (cima.y - baixo.y) }
    if (!tabela.has(baixo.y)) tabela.set(baixo.y, [])
    tabela.get(baixo.y).push(aresta)
    yMin = Math.min(yMin, baixo.y)
    yMax = Math.max(yMax, cima.y)
  })

  const pixels = []
  let ativas = []
  for (let y = yMin; y < yMax; y++) {
    ativas.push(...(tabela.get(y) ?? []))
    // tira a aresta antes do y de cima, senão o vértice conta duas vezes
    ativas = ativas.filter((a) => a.yMax > y)
    ativas.sort((a, b) => a.x - b.x)

    for (let i = 0; i + 1 < ativas.length; i += 2) {
      const inicio = Math.ceil(ativas[i].x - 1e-9)
      const fim = Math.floor(ativas[i + 1].x + 1e-9)
      for (let x = inicio; x <= fim; x++) pixels.push({ x, y })
    }

    for (const a of ativas) a.x += a.passo
  }

  return pixels
}
