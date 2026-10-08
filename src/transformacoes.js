// matrizes 3x3 em coordenadas homogêneas
const PASSO_TRANSLACAO = 1
const PASSO_ESCALA = 1.1
const PASSO_ROTACAO = 5

const TRANSFORMACOES = {
  translacao: { nome: 'Translação', teclas: '→ avança e ← retorna no eixo x. ↑ e ↓ movem no eixo y.' },
  escala: { nome: 'Escala', teclas: '→ aumenta e ← diminui a figura.' },
  rotacao: { nome: 'Rotação', teclas: `→ rotaciona +${PASSO_ROTACAO}° e ← rotaciona -${PASSO_ROTACAO}°.` },
}

function identidade() {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]
}

function translacao(tx, ty) {
  return [
    [1, 0, tx],
    [0, 1, ty],
    [0, 0, 1],
  ]
}

function escala(sx, sy) {
  return [
    [sx, 0, 0],
    [0, sy, 0],
    [0, 0, 1],
  ]
}

function rotacao(graus) {
  const a = (graus * Math.PI) / 180
  const cos = Math.cos(a)
  const sen = Math.sin(a)
  return [
    [cos, -sen, 0],
    [sen, cos, 0],
    [0, 0, 1],
  ]
}

function multiplicar(a, b) {
  const m = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) m[i][j] += a[i][k] * b[k][j]
    }
  }
  return m
}

function aplicar(m, { x, y }) {
  return {
    x: m[0][0] * x + m[0][1] * y + m[0][2],
    y: m[1][0] * x + m[1][1] * y + m[1][2],
  }
}

// leva o centro para a origem, aplica e devolve o centro para o lugar
function emTornoDe(c, m) {
  return multiplicar(translacao(c.x, c.y), multiplicar(m, translacao(-c.x, -c.y)))
}

function matrizDaTecla(tipo, tecla, centro) {
  const sentido = { ArrowRight: 1, ArrowLeft: -1 }[tecla]

  if (tipo === 'translacao') {
    if (tecla === 'ArrowUp') return translacao(0, PASSO_TRANSLACAO)
    if (tecla === 'ArrowDown') return translacao(0, -PASSO_TRANSLACAO)
    if (sentido) return translacao(sentido * PASSO_TRANSLACAO, 0)
  }
  if (!sentido) return null
  if (tipo === 'escala') {
    const s = sentido > 0 ? PASSO_ESCALA : 1 / PASSO_ESCALA
    return emTornoDe(centro, escala(s, s))
  }
  if (tipo === 'rotacao') return emTornoDe(centro, rotacao(sentido * PASSO_ROTACAO))
  return null
}

function arredondar({ x, y }) {
  return { x: Math.round(x), y: Math.round(y) }
}

// os algoritmos de rasterização trabalham com inteiros, então arredonda depois de transformar
function transformarParams(tipo, q, m) {
  if (tipo === 'reta') {
    const a = arredondar(aplicar(m, { x: q.x1, y: q.y1 }))
    const b = arredondar(aplicar(m, { x: q.x2, y: q.y2 }))
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
  }
  if (tipo === 'circulo') {
    // a escala é igual nos dois eixos, então o raio sai da distância até um ponto da borda
    const c = aplicar(m, { x: q.xc, y: q.yc })
    const borda = aplicar(m, { x: q.xc + q.r, y: q.yc })
    return { xc: Math.round(c.x), yc: Math.round(c.y), r: Math.round(Math.hypot(borda.x - c.x, borda.y - c.y)) }
  }
  return { vertices: q.vertices.map((v) => arredondar(aplicar(m, v))) }
}

function tamanho(q) {
  if (q.r !== undefined) return 2 * q.r
  const pontos = q.vertices ?? [{ x: q.x1, y: q.y1 }, { x: q.x2, y: q.y2 }]
  const xs = pontos.map((p) => p.x)
  const ys = pontos.map((p) => p.y)
  return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
}

function centroDaFigura(tipo, q) {
  if (tipo === 'reta') return { x: (q.x1 + q.x2) / 2, y: (q.y1 + q.y2) / 2 }
  if (tipo === 'circulo') return { x: q.xc, y: q.yc }
  const n = q.vertices.length
  return {
    x: q.vertices.reduce((soma, v) => soma + v.x, 0) / n,
    y: q.vertices.reduce((soma, v) => soma + v.y, 0) / n,
  }
}
