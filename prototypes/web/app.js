async function init(){
  await AsteriaI18n.init();
  const views = [...document.querySelectorAll('.view')];
  const buttons = [...document.querySelectorAll('[data-view]')];
  const params = new URLSearchParams(location.search);
  const initial = params.get('view') || 'home';

  function show(name){
    views.forEach(v => v.hidden = v.id !== `view-${name}`);
    buttons.forEach(b => b.classList.toggle('active', b.dataset.view === name));
    history.replaceState(null,'',`?view=${name}`);
  }

  buttons.forEach(b => b.addEventListener('click',()=>show(b.dataset.view)));
  show(initial);
}
init().catch(console.error);
