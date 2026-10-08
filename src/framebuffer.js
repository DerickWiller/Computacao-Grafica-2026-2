// buffer RGBA onde os pixels são pintados um a um
class Framebuffer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  redimensionar(largura, altura) {
    this.largura = largura
    this.altura = altura
    this.canvas.width = largura
    this.canvas.height = altura
    this.imagem = this.ctx.createImageData(largura, altura)
  }

  limpar() {
    this.imagem.data.fill(0)
  }

  // inverte o y para a origem ficar embaixo
  setPixel(x, y, [r, g, b]) {
    if (x < 0 || y < 0 || x >= this.largura || y >= this.altura) return
    const i = ((this.altura - 1 - y) * this.largura + x) * 4
    const dados = this.imagem.data
    dados[i] = r
    dados[i + 1] = g
    dados[i + 2] = b
    dados[i + 3] = 255
  }

  mostrar() {
    this.ctx.putImageData(this.imagem, 0, 0)
  }
}
