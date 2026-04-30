// === 菜品卡片 (复用) ===
function renderDishCard(d, opts) {
  opts = opts || {};
  var showReason = opts.showReason || false;
  var reason = d.reason || '';
  var score = d.match_score || d.rating || 0;
  var tags = (d.tags || []).map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('');
  var soldOut = d.is_sold_out ? '<div class="sold-out-badge">已售罄</div>' : '';
  return '<div class="dish-card" data-id="' + d.id + '" onclick="window.app.navigate(\'/dish/' + d.id + '\')">'
    + '<div class="dish-card-img" style="background:var(--primary-light);">'
    + '<span class="dish-emoji">' + (d.emoji || '🍽️') + '</span>'
    + soldOut
    + '</div>'
    + '<div class="dish-card-body">'
    + '<div class="dish-card-name">' + (d.name || '') + '</div>'
    + '<div class="dish-card-meta">¥' + (d.price || 0).toFixed(1) + ' · ' + (d.canteen_name || '') + '</div>'
    + '<div class="dish-card-rating">⭐ ' + (d.rating || '-').toFixed(1) + '</div>'
    + (showReason && reason ? '<div class="dish-card-reason">' + reason + '</div>' : '')
    + (showReason && score ? '<div class="match-bar"><div class="match-fill" style="width:' + score + '%"></div><span>' + Math.round(score) + '%</span></div>' : '')
    + '<div class="dish-card-tags">' + tags + '</div>'
    + '</div></div>';
}
