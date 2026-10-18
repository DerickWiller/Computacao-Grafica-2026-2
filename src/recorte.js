const COR_JANELA = '#c8c8c8'

const RECORTES = {
  linhas: { nome: 'Recorte de linhas', algoritmo: 'Cohen-Sutherland', tipo: 'reta' },
  poligonos: { nome: 'Recorte de polígonos', algoritmo: 'Sutherland-Hodgman', tipo: 'poligono' },
}

function retangulo(a, b) {
  return {
    xMin: Math.min(a.x, b.x),
    xMax: Math.max(a.x, b.x),
    yMin: Math.min(a.y, b.y),
    yMax: Math.max(a.y, b.y),
  }
}

function dentroDaJanela(p, j) {
  return codigoRegiao(p.x, p.y, j) === DENTRO
}

function cantosDaJanela(j) {
  return [
    { x: j.xMin, y: j.yMin },
    { x: j.xMax, y: j.yMin },
    { x: j.xMax, y: j.yMax },
    { x: j.xMin, y: j.yMax },
  ]
}

// devolve a figura recortada, ou null se ela ficou toda fora da janela
function recortarGeometria(tipo, g, j) {
  if (tipo === 'reta') {
    const r = recorteCohenSutherland(g.x1, g.y1, g.x2, g.y2, j)
    if (!r) return null
    return { x1: Math.round(r.x1), y1: Math.round(r.y1), x2: Math.round(r.x2), y2: Math.round(r.y2) }
  }
  const vertices = recorteSutherlandHodgman(g.vertices, j).map(arredondar)
  return vertices.length >= 3 ? { vertices } : null
}

// figuras fixas para testar o recorte sem precisar desenhar
function exemplosRecorte(tipo, largura, altura) {
  const p = (fx, fy) => ({ x: Math.round(fx * (largura - 1)), y: Math.round(fy * (altura - 1)) })
  const reta = (ferramenta, a, b) => ({ ferramenta, params: { x1: a.x, y1: a.y, x2: b.x, y2: b.y } })

  if (tipo === 'linhas') {
    return [
      reta('bresenham', p(0.05, 0.1), p(0.95, 0.9)),
      reta('bresenham', p(0.05, 0.9), p(0.95, 0.15)),
      reta('dda', p(0.1, 0.5), p(0.9, 0.55)),
      reta('dda', p(0.5, 0.05), p(0.45, 0.95)),
      reta('analitico', p(0.3, 0.2), p(0.6, 0.35)),
      reta('analitico', p(0.02, 0.6), p(0.25, 0.98)),
    ]
  }
  return [
    { ferramenta: 'varredura', params: { vertices: [p(0.06, 0.2), p(0.36, 0.12), p(0.44, 0.45), p(0.24, 0.68), p(0.04, 0.48)] } },
    { ferramenta: 'boundaryFill', params: { vertices: [p(0.55, 0.15), p(0.93, 0.15), p(0.93, 0.8), p(0.79, 0.8), p(0.79, 0.35), p(0.55, 0.35)] } },
    { ferramenta: 'varredura', params: { vertices: [p(0.42, 0.95), p(0.7, 0.95), p(0.52, 0.62)] } },
  ]
}
