const ZOOMS = [4, 6, 8, 10, 12, 16, 20, 24]
const RAIO_MAXIMO = 1000

const el = (id) => document.getElementById(id)
const tela = el('tela')
const inputRaio = el('raio')
const fb = new Framebuffer(el('canvas'))
const menu = iniciarMenu(document.querySelector('.barra-menu'))

const estado = {
  ferramenta: 'bresenham',
  zoom: 10,
  grade: true,
  primeiro: null, // ponto inicial da reta ou centro do círculo
  mouse: null,
  raioDigitado: null,
  primitivas: [],
}

const ferramenta = () => FERRAMENTAS[estado.ferramenta]

function parametros(ponto) {
  const p = estado.primeiro
  if (ferramenta().tipo === 'reta') return { x1: p.x, y1: p.y, x2: ponto.x, y2: ponto.y }
  const r = estado.raioDigitado ?? Math.round(Math.hypot(ponto.x - p.x, ponto.y - p.y))
  return { xc: p.x, yc: p.y, r }
}

function pintar(pixels, rgb) {
  for (const { x, y } of pixels) fb.setPixel(x, y, rgb)
}

function desenhar() {
  fb.limpar()
  for (const p of estado.primitivas) {
    pintar(FERRAMENTAS[p.ferramenta].rasterizar(p.params), hexParaRgb(p.cor))
  }

  // com raio digitado a prévia não depende do mouse
  const alvo = estado.raioDigitado !== null ? estado.primeiro : estado.mouse
  if (estado.primeiro && alvo) {
    const esmaecida = hexParaRgb(ferramenta().cor).map((c) => c * 0.45)
    pintar(ferramenta().rasterizar(parametros(alvo)), esmaecida)
  }
  if (estado.primeiro) fb.setPixel(estado.primeiro.x, estado.primeiro.y, [255, 255, 255])

  fb.mostrar()
}

function adicionar(params) {
  const f = ferramenta()
  const pixels = f.rasterizar(params)
  // o círculo repete alguns pontos na simetria, então conta só os diferentes
  const unicos = new Set(pixels.map((p) => `${p.x},${p.y}`))
  estado.primitivas.push({ ferramenta: estado.ferramenta, params, cor: f.cor, pixels: unicos.size })
  cancelar()
  atualizarLista()
}

function cancelar() {
  estado.primeiro = null
  estado.raioDigitado = null
  inputRaio.value = ''
  atualizarFerramenta()
  desenhar()
}


function atualizarFerramenta() {
  const f = ferramenta()
  const p = estado.primeiro
  const circulo = f.tipo === 'circulo'

  el('ferramenta-nome').textContent = `${circulo ? 'Circunferência' : 'Reta'} ${f.nome}`
  el('ferramenta-cor').style.setProperty('--c', f.cor)

  if (circulo) {
    el('instrucao').textContent = p
      ? `Centro em (${p.x}, ${p.y}). Clique para definir o raio ou digite o valor abaixo.`
      : 'Clique no centro da circunferência.'
  } else {
    el('instrucao').textContent = p
      ? `Ponto inicial em (${p.x}, ${p.y}). Clique no ponto final.`
      : 'Clique no ponto inicial da reta.'
  }

  el('form-raio').hidden = !circulo
  for (const campo of el('form-raio').querySelectorAll('input, button')) campo.disabled = !p

  for (const item of document.querySelectorAll('[data-algoritmo]')) {
    item.classList.toggle('ativo', item.dataset.algoritmo === estado.ferramenta)
  }
}

function atualizarLista() {
  const lista = el('lista')
  lista.innerHTML = ''
  el('vazio').hidden = estado.primitivas.length > 0

  estado.primitivas.forEach((p, i) => {
    const f = FERRAMENTAS[p.ferramenta]
    const q = p.params
    const pontos = f.tipo === 'reta'
      ? `(${q.x1}, ${q.y1}) → (${q.x2}, ${q.y2})`
      : `centro (${q.xc}, ${q.yc}), raio ${q.r}`

    const item = document.createElement('li')
    item.innerHTML = `
      <i class="cor" style="--c: ${p.cor}"></i>
      <span class="nome">${f.tipo === 'reta' ? 'Reta' : 'Circunferência'} ${f.nome}</span>
      <button class="remover" title="Remover">×</button>
      <span class="detalhe">${pontos} · ${p.pixels} px</span>`
    item.querySelector('.remover').onclick = () => {
      estado.primitivas.splice(i, 1)
      atualizarLista()
      desenhar()
    }
    lista.append(item)
  })
}

function executar(acao) {
  if (acao === 'desfazer') estado.primitivas.pop()
  if (acao === 'limpar') estado.primitivas = []
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

  if (estado.primeiro) desenhar()
})

tela.addEventListener('mouseleave', () => {
  el('cursor').style.display = 'none'
  el('status-mouse').textContent = 'x: -  y: -'
})

tela.addEventListener('click', (e) => {
  const p = pontoDoMouse(e)
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
  const item = e.target.closest('[data-algoritmo], [data-acao]')
  if (!item) return
  menu.fechar()
  if (item.dataset.algoritmo) {
    estado.ferramenta = item.dataset.algoritmo
    cancelar()
  } else {
    executar(item.dataset.acao)
  }
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') return menu.estaAberto() ? menu.fechar() : cancelar()
  if (e.target === inputRaio) return

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
