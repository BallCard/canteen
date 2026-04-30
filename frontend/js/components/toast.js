// === Toast 通知 ===
function showToast(msg, type) {
  type = type || 'info';
  var el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(function() { el.classList.add('toast-hide'); setTimeout(function() { el.remove(); }, 300); }, 2000);
}
