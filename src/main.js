const ZOOMS = [4, 6, 8, 10, 12, 16, 20, 24]
const RAIO_MAXIMO = 1000
const BRANCO = [255, 255, 255]
const NOMES = { reta: 'Reta', circulo: 'Circunferência', poligono: 'Polígono' }

const el = (id) => document.getElementById(id)
const tela = el('tela')
const inputRaio = el('raio')
const dialogoFaces = el('dialogo-faces')
const inputFaces = el('faces')
const fb = new Framebuffer(el('canvas'))
const menu = iniciarMenu(document.querySelector('.barra-menu'))

const estado = {
  ferramenta: 'bresenham',
  zoom: 10,
  grade: true,
  primeiro: null, // ponto inicial da reta ou centro do círculo
  mouse: null,
  raioDigitado: null,
  vertices: [],
  faces: null,
  primitivas: [],
  selecionada: null,
  transformacao: null,
}

const ferramenta = () => FERRAMENTAS[estado.ferramenta]
const tipoDe = (p) => FERRAMENTAS[p.ferramenta].tipo
const geometria = (p) => transformarParams(tipoDe(p), p.params, p.matriz)
// a média dos pontos se mantém na transformação, então dá para usar o centro original sem arredondar
const centroAtual = (p) => aplicar(p.matriz, centroDaFigura(tipoDe(p), p.params))

function parametros(ponto) {
  const p = estado.primeiro
  if (ferramenta().tipo === 'reta') return { x1: p.x, y1: p.y, x2: ponto.x, y2: ponto.y }
  const r = estado.raioDigitado ?? Math.round(Math.hypot(ponto.x - p.x, ponto.y - p.y))
  return { xc: p.x, yc: p.y, r }
}

function pintar(pixels, rgb) {
  const fundo = rgb.map((c) => c * 0.55)
  for (const { x, y, preenchido } of pixels) fb.setPixel(x, y, preenchido ? fundo : rgb)
}

function desenhar() {
  fb.limpar()
  for (const p of estado.primitivas) {
    pintar(FERRAMENTAS[p.ferramenta].rasterizar(geometria(p)), hexParaRgb(p.cor))
  }

  // marca o centro usado na escala e na rotação
  const sel = estado.selecionada
  if (sel && ['escala', 'rotacao'].includes(estado.transformacao)) {
    const c = centroAtual(sel)
    fb.setPixel(Math.round(c.x), Math.round(c.y), BRANCO)
  }

  const esmaecida = hexParaRgb(ferramenta().cor).map((c) => c * 0.45)

  if (estado.vertices.length) {
    const pontos = estado.mouse ? [...estado.vertices, estado.mouse] : estado.vertices
    pintar(contornoPoligono(pontos, pontos.length > 2), esmaecida)
    for (const v of estado.vertices) fb.setPixel(v.x, v.y, BRANCO)
  }

  // com raio digitado a prévia não depende do mouse
  const alvo = estado.raioDigitado !== null ? estado.primeiro : estado.mouse
  if (estado.primeiro && alvo) {
    pintar(ferramenta().rasterizar(parametros(alvo)), esmaecida)
  }
  if (estado.primeiro) fb.setPixel(estado.primeiro.x, estado.primeiro.y, BRANCO)

  fb.mostrar()
}

function adicionar(params) {
  const p = { ferramenta: estado.ferramenta, params, cor: ferramenta().cor, matriz: identidade() }
  estado.primitivas.push(p)
  estado.selecionada = p
  cancelar()
  atualizarLista()
}

// o círculo repete alguns pontos na simetria, então conta só os diferentes
function contarPixels(p) {
  const pixels = FERRAMENTAS[p.ferramenta].rasterizar(geometria(p))
  return new Set(pixels.map((q) => `${q.x},${q.y}`)).size
}

function cancelar() {
  estado.primeiro = null
  estado.raioDigitado = null
  estado.vertices = []
  inputRaio.value = ''
  atualizarFerramenta()
  desenhar()
}

function atualizarFerramenta() {
  const f = ferramenta()
  const p = estado.primeiro
  const circulo = f.tipo === 'circulo'

  el('ferramenta-nome').textContent = `${NOMES[f.tipo]} ${f.nome}`
  el('ferramenta-cor').style.setProperty('--c', f.cor)

  if (circulo) {
    el('instrucao').textContent = p
      ? `Centro em (${p.x}, ${p.y}). Clique para definir o raio ou digite o valor abaixo.`
      : 'Clique no centro da circunferência.'
  } else if (f.tipo === 'poligono') {
    el('instrucao').textContent =
      `Polígono de ${estado.faces} faces. Clique no vértice ${estado.vertices.length + 1} de ${estado.faces}.`
  } else {
    el('instrucao').textContent = p
      ? `Ponto inicial em (${p.x}, ${p.y}). Clique no ponto final.`
      : 'Clique no ponto inicial da reta.'
  }

  el('form-raio').hidden = !circulo
  el('alterar-faces').hidden = f.tipo !== 'poligono'
  for (const campo of el('form-raio').querySelectorAll('input, button')) campo.disabled = !p

  for (const item of document.querySelectorAll('[data-algoritmo]')) {
    item.classList.toggle('ativo', item.dataset.algoritmo === estado.ferramenta)
  }
}

function atualizarTransformacao() {
  const t = TRANSFORMACOES[estado.transformacao]
  el('transformacao-nome').textContent = t ? t.nome : 'Nenhuma'

  if (!t) el('transformacao-instrucao').textContent = 'Escolha uma no menu Transformações.'
  else if (!estado.selecionada) el('transformacao-instrucao').textContent = 'Desenhe uma figura ou selecione uma na lista.'
  else el('transformacao-instrucao').textContent = t.teclas

  el('restaurar').hidden = !estado.selecionada

  for (const item of document.querySelectorAll('[data-transformacao]')) {
    item.classList.toggle('ativo', item.dataset.transformacao === estado.transformacao)
  }
}

function atualizarLista() {
  const lista = el('lista')
  lista.innerHTML = ''
  el('vazio').hidden = estado.primitivas.length > 0
  if (!estado.primitivas.includes(estado.selecionada)) estado.selecionada = null

  estado.primitivas.forEach((p, i) => {
    const f = FERRAMENTAS[p.ferramenta]
    const q = geometria(p)
    const pontos = {
      reta: () => `(${q.x1}, ${q.y1}) → (${q.x2}, ${q.y2})`,
      circulo: () => `centro (${q.xc}, ${q.yc}), raio ${q.r}`,
      poligono: () => {
        const c = arredondar(centroDaFigura(f.tipo, q))
        return `${q.vertices.length} faces, centro (${c.x}, ${c.y})`
      },
    }[f.tipo]()

    const item = document.createElement('li')
    item.classList.toggle('selecionada', p === estado.selecionada)
    item.innerHTML = `
      <i class="cor" style="--c: ${p.cor}"></i>
      <span class="nome">${NOMES[f.tipo]} ${f.nome}</span>
      <button class="remover" title="Remover">×</button>
      <span class="detalhe">${pontos} · ${contarPixels(p)} px</span>`
    item.onclick = () => {
      estado.selecionada = p
      atualizarLista()
      desenhar()
    }
    item.querySelector('.remover').onclick = (e) => {
      e.stopPropagation()
      estado.primitivas.splice(i, 1)
      atualizarLista()
      desenhar()
    }
    lista.append(item)
  })

  atualizarTransformacao()
}

function transformar(tecla) {
  const sel = estado.selecionada
  if (!sel || !estado.transformacao) return false
  const m = matrizDaTecla(estado.transformacao, tecla, centroAtual(sel))
  if (!m) return false
  // a nova transformação entra à esquerda das que já foram aplicadas
  const nova = multiplicar(m, sel.matriz)
  // sem limite a figura cresce sem parar e o preenchimento trava a página
  const novoTamanho = tamanho(transformarParams(tipoDe(sel), sel.params, nova))
  if (novoTamanho > 2 * Math.max(fb.largura, fb.altura) && novoTamanho > tamanho(geometria(sel))) return true
  sel.matriz = nova
  atualizarLista()
  desenhar()
  return true
}

function executar(acao) {
  if (acao === 'faces') return pedirFaces(estado.ferramenta)
  if (acao === 'desfazer') estado.primitivas.pop()
  if (acao === 'limpar') estado.primitivas = []
  if (acao === 'restaurar' && estado.selecionada) estado.selecionada.matriz = identidade()
  if (acao === 'grade') estado.grade = !estado.grade
  if (acao === 'zoom-mais' || acao === 'zoom-menos') {
    const i = ZOOMS.indexOf(estado.zoom) + (acao === 'zoom-mais' ? 1 : -1)
    estado.zoom = ZOOMS[Math.min(Math.max(i, 0), ZOOMS.length - 1)]
  }
  if (acao === 'cancelar' || acao.startsWith('zoom')) cancelar()

  atualizarLista()
  if (acao === 'grade' || acao.startsWith('zoom')) ajustarTela()
  else desenhar()
}


function ajustarTela() {
  const palco = el('palco')
  const estilo = getComputedStyle(palco)
  const livreX = palco.clientWidth - parseFloat(estilo.paddingLeft) * 2 - 2
  const livreY = palco.clientHeight - parseFloat(estilo.paddingTop) * 2 - 2
  const z = estado.zoom
  const largura = Math.max(1, Math.floor(livreX / z))
  const altura = Math.max(1, Math.floor(livreY / z))

  fb.redimensionar(largura, altura)
  el('cursor').style.display = 'none'
  tela.style.width = `${largura * z}px`
  tela.style.height = `${altura * z}px`
  tela.style.setProperty('--zoom', `${z}px`)
  el('grade').classList.toggle('oculta', !estado.grade)
  el('status-grade').textContent = `${largura} × ${altura} pixels · zoom ${z}×`
  desenhar()
}

function pontoDoMouse(e) {
  const r = fb.canvas.getBoundingClientRect()
  const x = Math.floor(((e.clientX - r.left) / r.width) * fb.largura)
  const yTela = Math.floor(((e.clientY - r.top) / r.height) * fb.altura)
  return {
    x: Math.min(Math.max(x, 0), fb.largura - 1),
    y: fb.altura - 1 - Math.min(Math.max(yTela, 0), fb.altura - 1),
  }
}

tela.addEventListener('mousemove', (e) => {
  const p = pontoDoMouse(e)
  estado.mouse = p
  estado.raioDigitado = null

  const cursor = el('cursor')
  cursor.style.display = 'block'
  cursor.style.left = `${p.x * estado.zoom}px`
  cursor.style.top = `${(fb.altura - 1 - p.y) * estado.zoom}px`
  el('status-mouse').textContent = `x: ${p.x}  y: ${p.y}`

  if (estado.primeiro || estado.vertices.length) desenhar()
})

tela.addEventListener('mouseleave', () => {
  el('cursor').style.display = 'none'
  el('status-mouse').textContent = 'x: -  y: -'
})

tela.addEventListener('click', (e) => {
  const p = pontoDoMouse(e)
  if (ferramenta().tipo === 'poligono') {
    estado.vertices.push(p)
    if (estado.vertices.length === estado.faces) return adicionar({ vertices: estado.vertices })
    atualizarFerramenta()
    desenhar()
    return
  }
  if (!estado.primeiro) {
    estado.primeiro = p
    atualizarFerramenta()
    desenhar()
    if (ferramenta().tipo === 'circulo') inputRaio.focus()
    return
  }
  estado.raioDigitado = null
  adicionar(parametros(p))
})

function lerRaio() {
  const r = Number(inputRaio.value)
  return inputRaio.value !== '' && Number.isInteger(r) && r >= 0 && r <= RAIO_MAXIMO ? r : null
}

inputRaio.addEventListener('input', () => {
  estado.raioDigitado = lerRaio()
  desenhar()
})

el('form-raio').addEventListener('submit', (e) => {
  e.preventDefault()
  estado.raioDigitado = lerRaio()
  if (estado.primeiro && estado.raioDigitado !== null) adicionar(parametros(estado.primeiro))
})

document.addEventListener('click', (e) => {
  const item = e.target.closest('[data-algoritmo], [data-acao], [data-transformacao]')
  if (!item) return
  menu.fechar()
  const algoritmo = item.dataset.algoritmo
  if (item.dataset.transformacao) {
    estado.transformacao = item.dataset.transformacao
    atualizarTransformacao()
    desenhar()
  } else if (algoritmo && FERRAMENTAS[algoritmo].tipo === 'poligono') {
    pedirFaces(algoritmo)
  } else if (algoritmo) {
    estado.ferramenta = algoritmo
    cancelar()
  } else {
    executar(item.dataset.acao)
  }
})

let algoritmoPendente = null

function pedirFaces(algoritmo) {
  algoritmoPendente = algoritmo
  inputFaces.value = estado.faces ?? ''
  dialogoFaces.returnValue = ''
  dialogoFaces.showModal()
  inputFaces.select()
}

el('faces-cancelar').addEventListener('click', () => dialogoFaces.close())

dialogoFaces.addEventListener('close', () => {
  if (dialogoFaces.returnValue !== 'ok') return
  estado.ferramenta = algoritmoPendente
  estado.faces = Number(inputFaces.value)
  cancelar()
})

document.addEventListener('keydown', (e) => {
  if (dialogoFaces.open) return
  if (e.key === 'Escape') return menu.estaAberto() ? menu.fechar() : cancelar()
  if (e.target === inputRaio) return
  const modificador = e.ctrlKey || e.metaKey || e.altKey
  if (e.key.startsWith('Arrow') && !modificador && transformar(e.key)) return e.preventDefault()

  if (e.ctrlKey || e.metaKey) {
    if (e.key.toLowerCase() === 'z') {
      e.preventDefault()
      executar('desfazer')
    }
    return
  }
  if (e.key === '+' || e.key === '=') executar('zoom-mais')
  if (e.key === '-') executar('zoom-menos')
  if (e.key === 'g' || e.key === 'G') executar('grade')
})

window.addEventListener('resize', ajustarTela)

for (const item of document.querySelectorAll('[data-algoritmo]')) {
  item.querySelector('.cor').style.setProperty('--c', FERRAMENTAS[item.dataset.algoritmo].cor)
}
atualizarFerramenta()
atualizarLista()
ajustarTela()
