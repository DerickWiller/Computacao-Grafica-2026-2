// a velocidade da curva nunca passa de fator × maior lado do polígono de controle,
// então com essa quantidade duas amostras seguidas ficam a no máximo 1 pixel uma da outra
function quantidadeDeAmostras(pontos, fator) {
  let maior = 0
  for (let i = 1; i < pontos.length; i++) {
    maior = Math.max(maior, Math.hypot(pontos[i].x - pontos[i - 1].x, pontos[i].y - pontos[i - 1].y))
  }
  return Math.max(1, Math.ceil(fator * maior))
}

// liga as amostras com Bresenham para não ficar buraco entre elas
function ligarAmostras(amostras) {
  const pontos = []
  for (const a of amostras) {
    const p = { x: Math.round(a.x), y: Math.round(a.y) }
    const ultimo = pontos[pontos.length - 1]
    if (!ultimo || ultimo.x !== p.x || ultimo.y !== p.y) pontos.push(p)
  }
  if (!pontos.length) return []
  const pixels = [pontos[0]]
  for (let i = 1; i < pontos.length; i++) {
    const a = pontos[i - 1]
    const b = pontos[i]
    // o primeiro pixel de cada pedaço é o último do pedaço anterior
    pixels.push(...retaBresenham(a.x, a.y, b.x, b.y).slice(1))
  }
  return pixels
}
