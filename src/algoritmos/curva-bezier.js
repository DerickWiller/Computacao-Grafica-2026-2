// De Casteljau: interpola os pontos dois a dois até sobrar um só
function pontoBezier(pontos, t) {
  const p = pontos.map((q) => ({ x: q.x, y: q.y }))
  for (let n = p.length - 1; n > 0; n--) {
    for (let i = 0; i < n; i++) {
      p[i].x += (p[i + 1].x - p[i].x) * t
      p[i].y += (p[i + 1].y - p[i].y) * t
    }
  }
  return p[0]
}

// uma curva só, de grau n - 1, que passa pelo primeiro e pelo último ponto
function curvaBezier(pontos) {
  // na Bézier o fator é o grau
  const n = quantidadeDeAmostras(pontos, pontos.length - 1)
  const amostras = []
  for (let i = 0; i <= n; i++) amostras.push(pontoBezier(pontos, i / n))
  return ligarAmostras(amostras)
}
