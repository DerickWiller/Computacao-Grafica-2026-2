function contornoPoligono(vertices, fechado = true) {
  const pixels = []
  const arestas = fechado ? vertices.length : vertices.length - 1
  for (let i = 0; i < arestas; i++) {
    const a = vertices[i]
    const b = vertices[(i + 1) % vertices.length]
    pixels.push(...retaBresenham(a.x, a.y, b.x, b.y))
  }
  return pixels
}

// regra par-ímpar
function dentroDoPoligono(vertices, x, y) {
  let dentro = false
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const a = vertices[i]
    const b = vertices[j]
    if ((a.y > y) !== (b.y > y) && x < a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y)) dentro = !dentro
  }
  return dentro
}
