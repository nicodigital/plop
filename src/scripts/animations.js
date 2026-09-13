/**
 * Animations module (IntersectionObserver)
 *
 * Uso básico en markup:
 *  - class="anim" data-anim="bottom|top|left|right|fade"
 *  - class="anim" data-anim="clip-bottom|clip-top|clip-left|clip-right"
 *
 * Parámetros disponibles (data-attributes):
 *  - data-delay="300"         -> delay en ms antes de activar .anim-on
 *  - data-delay-mobile="150"  -> override de delay solo en mobile (< 992px)
 *  - data-speed="0.8"         -> duración en segundos
 *  - data-once="true"         -> anima una sola vez (no se quita .anim-on al salir)
 *  - data-mobile="false"      -> en mobile no anima (se muestra de inmediato)
 *  - data-reset="top|bottom|both"
 *                              -> controla cuándo resetear al salir del viewport
 *
 * Notas:
 *  - .anim-img espera la carga de <img> antes de activar la animación.
 *  - .force dispara animación al cargar la página sin esperar observer.
 *  - threshold 0.4 dispara la entrada; threshold 0 detecta salida real
 *    (isIntersecting es true mientras quede un píxel visible).
 */
function animations () {
  const animations = document.querySelectorAll('.anim')
  if (animations.length === 0) return

  const ANIM_THRESHOLD = 0.4
  const pendingTimeouts = new WeakMap()

  // Cache mobile check - only recalculate on resize
  let isMobile = window.innerWidth < 992
  let resizeTimeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      isMobile = window.innerWidth < 992
    }, 150)
  }, { passive: true })

  const clearPending = (element) => {
    const id = pendingTimeouts.get(element)
    if (id == null) return
    clearTimeout(id)
    pendingTimeouts.delete(element)
  }

  const applyAnimation = (element, once = false, observer = null) => {
    const delay = parseInt(isMobile && element.dataset.delayMobile != null ? element.dataset.delayMobile : element.dataset.delay, 10) || 0
    const speed = element.dataset.speed ? element.dataset.speed + 's' : '1s'

    const run = () => {
      pendingTimeouts.delete(element)
      element.style.animationDuration = speed
      element.classList.add('anim-on')
      if (once && observer) observer.unobserve(element)
    }

    clearPending(element)

    if (delay > 0) {
      pendingTimeouts.set(element, setTimeout(run, delay))
    } else {
      run()
    }
  }

  // Handle image loading
  const handleImageAnimation = (element, once, observer) => {
    const img = element.querySelector('img')
    if (!img) {
      applyAnimation(element, once, observer)
      return
    }
    if (img.complete) {
      applyAnimation(element, once, observer)
    } else {
      img.addEventListener('load', () => applyAnimation(element, once, observer), { once: true })
    }
  }

  // Check if animation should apply based on mobile setting
  const shouldAnimate = (element) => {
    const mobile = element.dataset.mobile ?? 'true'
    return mobile === 'true' || !isMobile
  }

  const isClipAnim = (element) => {
    const type = element.dataset.anim ?? ''
    return type.startsWith('clip')
  }

  // Check if element should reset based on data-reset attribute and exit direction
  const shouldReset = (element, boundingRect) => {
    const reset = element.dataset.reset

    // Si no tiene data-reset, resetea siempre (comportamiento por defecto)
    if (!reset) return true

    // Determinar si salió por arriba o por abajo
    const exitedTop = boundingRect.bottom < 0
    const exitedBottom = boundingRect.top > window.innerHeight

    if (reset === 'top' && exitedTop) return true
    if (reset === 'bottom' && exitedBottom) return true
    if (reset === 'both') return true

    return false
  }

  const resetAnimation = (element) => {
    clearPending(element)
    element.classList.remove('anim-on')
    element.style.removeProperty('opacity')
  }

  const triggerAnim = (entries, observer) => {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const element = entry.target
      const once = element.dataset.once === 'true'

      if (entry.isIntersecting) {
        const ready = isClipAnim(element) || entry.intersectionRatio >= ANIM_THRESHOLD
        if (!ready) continue
        if (!shouldAnimate(element)) continue
        if (element.classList.contains('anim-on')) continue

        if (element.classList.contains('anim-img')) {
          handleImageAnimation(element, once, observer)
        } else {
          applyAnimation(element, once, observer)
        }
      } else if (once) {
        // data-once: no quitar .anim-on. Si aún no se ejecutó, cancelar el delay
        // para que pueda dispararse de nuevo al volver a entrar.
        if (!element.classList.contains('anim-on')) clearPending(element)
      } else if (shouldReset(element, entry.boundingClientRect)) {
        resetAnimation(element)
      }
    }
  }

  const observer = new IntersectionObserver(triggerAnim, {
    root: null,
    rootMargin: '0px',
    threshold: [0, ANIM_THRESHOLD]
  })

  // Observer con threshold 0 para elementos clip (que están ocultos visualmente)
  const clipObserver = new IntersectionObserver(triggerAnim, {
    root: null,
    rootMargin: '0px',
    threshold: 0
  })

  animations.forEach(element => {
    // En mobile, si data-mobile="false", mostrar al instante sin animación
    if (isMobile && !shouldAnimate(element)) {
      element.style.animationDuration = '0s'
      element.classList.add('anim-on')
      return
    }

    // Usar clipObserver para elementos con animaciones clip
    if (element.dataset.anim && element.dataset.anim.startsWith('clip')) {
      clipObserver.observe(element)
    } else {
      observer.observe(element)
    }
  })

  // Trigger animations for elements with .force class on page load
  const forceElements = document.querySelectorAll('.force')
  if (forceElements.length > 0) {
    forceElements.forEach(element => {
      if (shouldAnimate(element)) {
        if (element.classList.contains('anim-img')) {
          handleImageAnimation(element, false, null)
        } else {
          applyAnimation(element, false, null)
        }
      }
    })
  }
}

export default animations
