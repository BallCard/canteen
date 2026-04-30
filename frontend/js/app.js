// === SPA Router Engine ===
(function(){
  var app = window.app = {};
  var currentPage = null;
  var routes = {};

  // Register routes
  function register(name, pageObj) {
    routes[name] = pageObj;
  }
  app.register = register;

  // Navigate
  function navigate(path) {
    if (path.indexOf('/dish/') === 0 && !isNaN(path.split('/')[2])) {
      window.location.hash = '#/dish/' + path.split('/')[2];
      return;
    }
    window.location.hash = '#' + path;
  }
  app.navigate = navigate;

  // Back
  function back() {
    window.history.back();
  }
  app.back = back;

  // Router
  function router() {
    var hash = window.location.hash || '#/';
    var path = hash.replace('#', '') || '/';
    var pageName = path.split('?')[0].split('/')[1] || '/';
    pageName = '/' + pageName;

    var pageObj = routes[pageName];
    if (!pageObj) { pageName = '/'; pageObj = routes['/']; path = '/'; }

    // Unmount old
    if (currentPage && currentPage.onUnmounted) currentPage.onUnmounted();

    // Update header
    var title = pageObj.title || '浙大食堂';
    document.getElementById('app-title').textContent = title;
    document.getElementById('back-btn').classList.toggle('hidden', pageObj.showBack !== true);

    // Render
    var container = document.getElementById('page-content');
    container.innerHTML = '<div class="loading-screen">加载中...</div>';

    // Use setTimeout to allow DOM update before heavy rendering
    setTimeout(function() {
      if (pageObj.render) {
        container.innerHTML = pageObj.render(path);
      }
      currentPage = pageObj;
      updateTabbar(pageName);

      if (pageObj.onMounted) {
        // Pass parsed params
        var params = parseParams(path);
        pageObj.onMounted(params);
      }
    }, 16);
  }

  function parseParams(path) {
    var parts = path.split('/');
    var params = {};
    // /dish/123 → { id: '123' }
    if (parts.length >= 3 && !isNaN(parts[2])) {
      params.id = parts[2];
    }
    // query string
    var qs = path.split('?')[1];
    if (qs) {
      qs.split('&').forEach(function(p) {
        var kv = p.split('=');
        if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      });
    }
    return params;
  }

  // Listen hash change
  window.addEventListener('hashchange', router);
  window.addEventListener('load', router);

  // Expose
  app.router = router;
})();
