/* 自作ミニライブラリ */
//ホバーの更新回数減少
var enableTimer = 0;
window.addEventListener('scroll', function() {
	clearTimeout(enableTimer);
	removeHoverClass();
	enableTimer = setTimeout(addHoverClass, 1000);
}, false);
function removeHoverClass() {
	document.body.classList.remove('hover');
}
function addHoverClass() {
	document.body.classList.add('hover');
}