const FERRAMENTAS = {
  analitico: {
    nome: 'Analítico',
    tipo: 'reta',
    cor: '#f5a524',
    rasterizar: (p) => retaAnalitica(p.x1, p.y1, p.x2, p.y2),
  },
  dda: {
    nome: 'DDA',
    tipo: 'reta',
    cor: '#3ccfe8',
    rasterizar: (p) => retaDDA(p.x1, p.y1, p.x2, p.y2),
  },
  bresenham: {
    nome: 'Bresenham',
    tipo: 'reta',
    cor: '#b388ff',
    rasterizar: (p) => retaBresenham(p.x1, p.y1, p.x2, p.y2),
  },
  circulo: {
    nome: 'Bresenham',
    tipo: 'circulo',
    cor: '#4ade80',
    rasterizar: (p) => circunferenciaBresenham(p.xc, p.yc, p.r),
  },
}

function hexParaRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
