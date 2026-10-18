const DENTRO = 0
const ESQUERDA = 1
const DIREITA = 2
const BAIXO = 4
const CIMA = 8

function codigoRegiao(x, y, j) {
  let codigo = DENTRO
  if (x < j.xMin) codigo |= ESQUERDA
  else if (x > j.xMax) codigo |= DIREITA
  if (y < j.yMin) codigo |= BAIXO
  else if (y > j.yMax) codigo |= CIMA
  return codigo
}

// devolve o pedaço da reta que fica dentro da janela, ou null se não sobrar nada
function recorteCohenSutherland(x1, y1, x2, y2, j) {
  let c1 = codigoRegiao(x1, y1, j)
  let c2 = codigoRegiao(x2, y2, j)

  while (true) {
    if ((c1 | c2) === 0) return { x1, y1, x2, y2 }
    // as duas pontas do mesmo lado de fora
    if ((c1 & c2) !== 0) return null

    const fora = c1 !== 0 ? c1 : c2
    let x
    let y
    if (fora & CIMA) {
      x = x1 + ((x2 - x1) * (j.yMax - y1)) / (y2 - y1)
      y = j.yMax
    } else if (fora & BAIXO) {
      x = x1 + ((x2 - x1) * (j.yMin - y1)) / (y2 - y1)
      y = j.yMin
    } else if (fora & DIREITA) {
      y = y1 + ((y2 - y1) * (j.xMax - x1)) / (x2 - x1)
      x = j.xMax
    } else {
      y = y1 + ((y2 - y1) * (j.xMin - x1)) / (x2 - x1)
      x = j.xMin
    }

    if (fora === c1) {
      x1 = x
      y1 = y
      c1 = codigoRegiao(x1, y1, j)
    } else {
      x2 = x
      y2 = y
      c2 = codigoRegiao(x2, y2, j)
    }
  }
}
