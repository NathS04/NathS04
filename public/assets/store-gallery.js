const gallery = document.querySelector('[data-gallery]');
if (gallery) {
  const views = [...gallery.querySelectorAll('[data-art-view]')];
  const links = [...gallery.querySelectorAll('[data-art-link]')];

  function selectView() {
    const selected = views.find(view => '#' + view.id === location.hash) || views[0];
    for (const view of views) view.hidden = view !== selected;
    for (const link of links) {
      if (link.hash === '#' + selected.id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }

  for (const link of links) {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      selectView();
    });
  }
  window.addEventListener('hashchange', selectView);
  window.addEventListener('popstate', selectView);
  selectView();
}
