// funções de base da B-Spline cúbica uniforme
function pontoBSpline(p0, p1, p2, p3, t) {
  const t2 = t * t
  const t3 = t2 * t
  const b0 = (1 - t) ** 3 / 6
  const b1 = (3 * t3 - 6 * t2 + 4) / 6
  const b2 = (-3 * t3 + 3 * t2 + 3 * t + 1) / 6
  const b3 = t3 / 6
  return {
    x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
    y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y,
  }
}

// cada 4 pontos seguidos formam um segmento, então n pontos dão n - 3 segmentos
function curvaBSpline(pontos) {
  const amostras = []
  for (let i = 0; i + 3 < pontos.length; i++) {
    const [p0, p1, p2, p3] = pontos.slice(i, i + 4)
    // na B-Spline cúbica uniforme o fator é 1
    const n = quantidadeDeAmostras([p0, p1, p2, p3], 1)
    // o começo de cada segmento repete o fim do anterior, então pula o t = 0
    for (let k = i === 0 ? 0 : 1; k <= n; k++) amostras.push(pontoBSpline(p0, p1, p2, p3, k / n))
  }
  return ligarAmostras(amostras)
}
