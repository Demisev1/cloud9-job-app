
const routes = {};
function route(path, render) { routes[path] = render; }
async function render() {
  const hash = location.hash || '#/';
  const view = document.getElementById('view');
  view.innerHTML = '';
  const renderFn = routes[hash.split('?')[0]] || routes['#/404'];
  view.appendChild(await renderFn());
}
window.addEventListener('hashchange', render);
window.addEventListener('load', render);
