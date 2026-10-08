// Abre no clique; com um menu aberto, passar o mouse em outro título troca de menu.
function iniciarMenu(barra) {
  let aberto = null

  function abrir(menu) {
    fechar()
    menu.classList.add('aberto')
    aberto = menu
  }

  function fechar() {
    aberto?.classList.remove('aberto')
    aberto = null
  }

  for (const menu of barra.querySelectorAll('.menu')) {
    const titulo = menu.querySelector('.menu-titulo')
    titulo.addEventListener('click', () => (aberto === menu ? fechar() : abrir(menu)))
    titulo.addEventListener('mouseenter', () => {
      if (aberto && aberto !== menu) abrir(menu)
    })
  }

  document.addEventListener('pointerdown', (e) => {
    if (!barra.contains(e.target)) fechar()
  })

  return { fechar, estaAberto: () => aberto !== null }
}
