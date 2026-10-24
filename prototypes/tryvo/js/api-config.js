/* Public API location only. Provider credentials stay on the Python server. */
window.TryvoApiUrl = (() => {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  const base = (window.TRYVO_API_URL ?? (local ? '' : 'https://tryvu-5.onrender.com')).replace(/\/+$/, '');
  return path => base + path;
})();
