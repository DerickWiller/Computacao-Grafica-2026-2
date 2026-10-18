// recorta o polígono por um lado da janela de cada vez
function recorteSutherlandHodgman(vertices, j) {
  const lados = [
    { dentro: (p) => p.x >= j.xMin, cruzar: (a, b) => cruzarX(a, b, j.xMin) },
    { dentro: (p) => p.x <= j.xMax, cruzar: (a, b) => cruzarX(a, b, j.xMax) },
    { dentro: (p) => p.y >= j.yMin, cruzar: (a, b) => cruzarY(a, b, j.yMin) },
    { dentro: (p) => p.y <= j.yMax, cruzar: (a, b) => cruzarY(a, b, j.yMax) },
  ]

  let saida = vertices
  for (const lado of lados) {
    const entrada = saida
    saida = []
    for (let i = 0; i < entrada.length; i++) {
      const atual = entrada[i]
      const anterior = entrada[(i + entrada.length - 1) % entrada.length]
      if (lado.dentro(atual)) {
        if (!lado.dentro(anterior)) saida.push(lado.cruzar(anterior, atual))
        saida.push(atual)
      } else if (lado.dentro(anterior)) {
        saida.push(lado.cruzar(anterior, atual))
      }
    }
  }

  return saida
}

function cruzarX(a, b, x) {
  return { x, y: a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x) }
}

function cruzarY(a, b, y) {
  return { x: a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y), y }
}
