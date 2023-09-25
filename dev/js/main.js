const IS_ACTIVE = 'is-active',
  IS_HIDDEN = 'is-hidden',
  IS_EXPANDED = 'is-expanded'

const $body = $('body')

const lightBodyColor = '#ffffff',
  darkBodyColor = '#121212'

/* #region  Extends */
$.fn.extend({
  exists: function () { return this.length },
  setBackScreen: function (opacityVal, filterVal) {
    let target = this instanceof jQuery ? $(this).get(0) : this
    Object.assign(target.style, { opacity: opacityVal, filter: `grayscale(${filterVal})` })
  },
  isVisible: function () { return $(this).is(':visible') }
})
/* #endregion */


/* #region  Utils */
const getTransitionTime = (target) => {
  let el = target instanceof jQuery ? target[0] : target
  return (parseFloat(window.getComputedStyle(el).transitionDuration) * 1000)
}
const toggleSiblingClass = (target, cls = IS_ACTIVE) => {
  let mainClass = target.attr('class').split(' ')[0],
    sib = [...target.siblings(`.${mainClass}`)],
    active = sib.filter(el => el.classList.contains(cls))

  $.each(active, (i) => { active[i].classList.remove(cls) })
  target.addClass(cls)
}
const getEvtDOM = (evtAttr) => {
  return $(`[data-evt="${evtAttr}"]`)
}
const getPlayerEvtDOM = (evtAttr) => {
  return $(`[data-player-evt="${evtAttr}"]`)
}
/* #endregion */


/* #region  Click ripple effect */
class rippleClickEffect {
  constructor(el, event) {
    this._el = el
    this._event = event
    this.extend = {
      rippleClass: 'eff_ripple-circle',
      animateClass: 'ripple-circle_animated'
    }
  }
  push() {
    if (this._el.css('position') !== 'relative') {
      Object.assign(this._el[0].style, { position: 'relative' })
    }

    if (this._el.css('overflow') !== 'hidden') {
      Object.assign(this._el[0].style, { overflow: 'hidden' })
    }

    if (this._el.find(`.${this.extend.rippleClass}`).length == 0) {
      this._el.prepend($(`<span class="${this.extend.rippleClass}"></span>`))
    }

    let circle = this._el.find(`.${this.extend.rippleClass}`); circle.removeClass(`${this.extend.animateClass}`)
    if (!circle.height() && !circle.width()) {
      let d = Math.max(this._el.outerWidth(), this._el.outerHeight()); circle.css({ height: d, width: d })
    }

    let x = this._event.pageX - this._el.offset().left - circle.width() / 2, y = this._event.pageY - this._el.offset().top - circle.height() / 2

    circle.css({ top: y + 'px', left: x + 'px' }).addClass(this.extend.animateClass)
  }
}
let rippleArr = Array.from($('.apl-menu-tab, .apl-song, .apl-pag__btn, .apl-row-btn, .apl-main-btn, .search-row__btn, .player__nav-btn, .player-btn, .player__footer-btn'))
$.each(rippleArr, function (i) {
  rippleArr[i].onclick = (e) => { const $thisRipple = new rippleClickEffect($(this), e); $thisRipple.push() }
})
/* #endregion */


/* #region  Scroll Lock functions */
const lockScroll = () => { setTimeout(function () { if (!document.body.hasAttribute("ib-scroll-lock")) { let o = window.pageYOffset || document.documentElement.scrollTop; document.body.setAttribute("ib-scroll-lock", o), document.body.style.overflow = "hidden", document.body.style.position = "fixed", document.body.style.top = "-" + o + "px", document.body.style.left = "0", document.body.style.width = "100%" } }, 1) }
const unlockScroll = () => { if (document.body.hasAttribute("ib-scroll-lock")) { let o = document.body.getAttribute("ib-scroll-lock"); document.body.removeAttribute("ib-scroll-lock"), document.body.style.overflow = "", document.body.style.position = "", document.body.style.top = "", document.body.style.left = "", document.body.style.width = "", window.scroll(0, o) } }
/* #endregion */




const apl = new Object({
  init: function () {
    this.renderDOM()
    this.bindEvents()
    aplOver.init()
    aplMore.init()
    player.init()
  },
  renderDOM: function () {
    // DOM
    this.mainSearchInput = $('#mainSearchInput')
    this.mainContent = $('.apl-content')
    // Events
    this.evtToggleMenu = getEvtDOM('toggleMenu')
    this.evtToggleSearch = getEvtDOM('toggleSearch')
    this.evtOpenMore = $('[data-apl-more]')
  },
  bindEvents: function () {
    this.evtToggleMenu.click(function () {
      aplOver.toggle('menu')
    })
    this.evtToggleSearch.click(function () {
      aplOver.toggle('search')
    })
    this.mainSearchInput.on('focus click', function (e) {
      e.preventDefault()
      aplOver.toggle('search')
    })
    this.evtOpenMore.click(function () {
      let att = $(this).data('apl-more')
      aplMore.toggle(att)
    })
  },
  fn: {
    toggleContentVisible: (boolean = true) => {
      let el = apl.mainContent
      if (!boolean) {
        el.setBackScreen('0.2', 1)
      } else {
        el.setBackScreen(1, 0)
      }
    }
  },
  intiFn: {

  }
})


const aplOver = new Object({
  initialized: undefined,
  init: function () {
    this.renderDOM()
    this.bindEvents()
    this.initialized = true
  },
  renderDOM: function () {
    this._ = $('.apl-over')
    this.screen = $('.apl-over-screen')
    this.search = this.screen.filter('#overSearch')
    this.menu = this.screen.filter('#overMenu')
    this.menuTab = $('.apl-menu-tab')
    // Search
    this.searchInput = $('#overSearchInput')
  },
  bindEvents: function () {
    this.menuTab.click(function () { toggleSiblingClass($(this)) })
    this.searchInput.on('input', function () {
      let val = $(this).val(), rowArr = Array.from(aplOver.search.find('.search-row'))
      if (val.length !== 0) {
        $.each(rowArr, (i) => { rowArr[i].classList.add(IS_EXPANDED) })
      } else {
        $.each(rowArr, (i) => { rowArr[i].classList.remove(IS_EXPANDED) })
      }
    })
  },
  toggle: function (type) {
    let el
    aplOver.screen.hide()
    switch (type) {
      case 'search': el = aplOver.search; break;
      case 'menu': el = aplOver.menu; break;
      default: el = aplOver.menu; break;
    }

    if (aplOver._.exists() && el.exists()) {
      if (aplOver._.is(':visible')) {
        unlockScroll()
        aplOver._.hide()
      } else {
        lockScroll()
        aplOver._.show()
        el.show()
      }
    } else { return }
  }
})


const aplMore = new Object({
  init: function () {
    this.renderDOM()
    this.bindEvents()
    this.attachFilters()
  },
  renderDOM: function () {
    this._ = $('.apl-more')
    this.container = this._.find('.apl-more-container')
    this.screen = this._.find('.apl-more-screen')
    this.screenModal = this._.find('.screen-modal')
    // EVT
    this.evtFilter = $('[data-more-evt="filterContent"]')
  },
  bindEvents: function () {

  },
  toggle: function (type) {
    if (aplMore._.length) {
      if (aplMore._.isVisible()) {

        unlockScroll()
        apl.fn.toggleContentVisible(true)
        aplMore.container.css({ transform: 'translateX(100%)' })
        setTimeout(() => {
          aplMore._.hide()
        }, getTransitionTime(aplMore.container));

      } else {
        this.reset = () => {
          aplMore._.hide(); aplMore.screen.hide(); aplMore.container.css({ transform: 'translateX(100%)' }); aplMore._.show(); toShow.show()
        }

        let filtered = (id) => { return aplMore.screen.filter(`#${id}`) }, toShow
        switch (type) {
          case 'songs':
            toShow = filtered('moreSongs'); break;
          case 'videos':
            toShow = filtered('moreVideos'); break;
          case 'merch':
            toShow = filtered('moreMerch'); break;
          case 'albums':
            toShow = filtered('moreAlbums'); break;
          default:
            return false
        }

        this.reset();

        setTimeout(() => {
          lockScroll()
          aplMore.container.css({ transform: 'translateX(0%)' })
          apl.fn.toggleContentVisible(false)
        }, 1);
      }
    } else {
      return false
    }
  },
  attachFilters: function () {
    let parent = aplMore.screen
    $.each(parent, (i) => {
      let $parent = $(parent[i]),
        screenModal = $parent.find(aplMore.screenModal)
      if (screenModal.length) {

        const modal = {
          init: function () {
            this.renderDOM()
            this.bindEvents()
          },
          renderDOM: function () {
            this._ = $parent.find('.screen-modal')
            this.backdrop = this._.find('.screen-modal__backdrop')
            this.container = this._.find('.screen-modal__container')
            this.closeBtn = this._.find('.screen-modal__close-btn')
            this.tab = this._.find('button')
          },
          bindEvents: function () {
            this.closeBtn.click(function () { modal.toggle() })
            this.backdrop.click(function () { modal.toggle() })
            this.tab.click(function () { toggleSiblingClass($(this)); modal.toggle() })
          },
          toggle: function () {
            if (modal._.isVisible()) {
              modal.backdrop.css({ opacity: 0 })
              modal.container.css({ transform: 'translateY(100%)' })
              setTimeout(() => {
                modal._.hide()
              }, getTransitionTime(modal.container));
            } else {
              modal._.show()
              setTimeout(() => {
                modal.backdrop.css({ opacity: 1 })
                modal.container.css({ transform: 'translateY(0%)' })
              }, 1);
            }
          }
        }
        modal.init()

        let filterBtn = $parent.find(aplMore.evtFilter)
        filterBtn.click(function () { modal.toggle() })
      }
    })
  },
  close: function () {
    unlockScroll()
    apl.fn.toggleContentVisible(true)
    aplMore.container.css({ transform: 'translateX(100%)' })
    aplMore._.hide()
  }
})


const player = new Object({
  isOpened: undefined,
  xBefore: undefined,
  yBefore: undefined,
  init: function () {
    this.renderDOM()
    this.bindEvents()
    this.close()
  },
  renderDOM: function () {
    // Navigation
    this._ = $('.player')
    this.navBtn = $('.player__nav-btn')
    this.navContainer = $('.player__nav')
    this.section = $('.player__section')
    this.sectionName = $('.player__section-name')
    this.evtClose = getPlayerEvtDOM('close')
    this.evtOpen = getPlayerEvtDOM('open')
  },
  bindEvents: function () {
    this.navBtn.click(function () { player.fn.toggleSection($(this)) })
    this.evtClose.click(function () { player.close() })
    this.evtOpen.click(function () {
      if (player.isOpened) {
        return
      } else {
        player.open()
      }
    })
  },
  fn: {
    toggleSection: function (target) {
      if (target.length) {
        let attr = target.data('player-evt')
        if (attr) {
          let el = player.section;
          let title, section
          switch (attr) {
            case 'playlist':
              title = 'My Playlist'
              section = el.filter('#playerPlaylist')
              break;
            case 'videos':
              title = 'Music Videos'
              section = el.filter('#playerVideos')
              break;
            case 'interviews':
              title = 'Interviews'
              section = el.filter('#playerInterviews')
              break;
            case 'audios':
              title = 'Audios'
              section = el.filter('#playerAudios')
              break;
            case 'live':
              title = 'Live'
              section = el.filter('#playerLive')
              break;
            default:
              title = 'My Playlist'
              section = el[0]
              break;
          }
          if (el.length && section.length) {
            el.hide(); section.show(); player.sectionName.html(title)
            player.navBtn.removeClass(IS_ACTIVE).filter(target).addClass(IS_ACTIVE)
          }
        } else {
          return false
        }
      }
    },
    setAxis: function (reset) {
      if (reset == 0) {
        player.xBefore = 0
        player.yBefore = 0
      } else {
        player.xBefore = window.pageXOffset || document.documentElement.scrollLeft
        player.yBefore = window.pageYOffset || document.documentElement.scrollTop
      }
    }
  },
  open: function () {
    player.isOpened = true
    apl.mainContent.hide()
    this._.show()
    $body.css({ background: darkBodyColor, 'background-color': darkBodyColor })
    $(player.navBtn[0]).trigger('click')
    if (aplMore._.isVisible()) {
      aplMore.close()
    }
    window.scrollTo(0, 0)
  },
  close: function () {
    player.isOpened = false
    apl.mainContent.show()
    this._.hide()
    $body.css({ background: lightBodyColor, 'background-color': lightBodyColor })
    window.scrollTo(0, 0)
  }
})


$(document).ready(function () {
  apl.init()
})