// === TabBar 管理 ===
function updateTabbar(route) {
  var items = document.querySelectorAll('#tabbar .tab-item');
  var showTab = true;
  // 隐藏 tabbar 的页面 (如菜单详情页)
  if (route === '/menu' || route.indexOf('/dish') === 0) showTab = false;
  document.getElementById('tabbar').style.display = showTab ? 'flex' : 'none';
  items.forEach(function(el) {
    var r = el.getAttribute('data-route');
    el.classList.toggle('active', r === route);
  });
}
