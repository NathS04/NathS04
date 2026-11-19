const card = document.querySelector('[data-system-card]');
if (card) {
  const systems = JSON.parse(document.querySelector('#system-data').textContent);
  for (const button of card.querySelectorAll('[data-system-index]')) {
    button.addEventListener('click', () => {
      const selected = systems[Number(button.dataset.systemIndex)];
      card.querySelector('[data-system-name]').textContent = selected.name;
      card.querySelector('[data-system-category]').textContent = selected.category;
      const caseLink = card.querySelector('[data-system-link]');
      if (caseLink) { caseLink.href = '/projects/'+selected.slug+'/'; caseLink.setAttribute('aria-label','Read the '+selected.name+' case study'); }
      card.querySelectorAll('[data-step-label]').forEach((node, i) => { node.textContent = selected.flow[i]; });
      for (const tab of card.querySelectorAll('[data-system-index]')) tab.setAttribute('aria-pressed', String(tab === button));
    });
  }
}
document.querySelector('[data-print-cv]')?.addEventListener('click', () => window.print());
for (const menu of document.querySelectorAll('.mobile-nav')) {
  for (const link of menu.querySelectorAll('a')) link.addEventListener('click',()=>{menu.open=false;});
  menu.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.open=false;menu.querySelector('summary').focus();}});
  document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false;});
}
