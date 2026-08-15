/* Theme toggle.
 *
 * The site is fully readable with this file blocked or JS disabled: the palette
 * comes from prefers-color-scheme in CSS, and the button ships hidden so a
 * control that cannot work is never shown. This script is the only JavaScript
 * on the site. */

(function () {
  'use strict';

  var root = document.documentElement;
  var button = document.getElementById('theme-toggle');
  if (!button) return;

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function currentTheme() {
    return root.getAttribute('data-theme') || (systemPrefersDark() ? 'dark' : 'light');
  }

  function render() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    button.textContent = next === 'dark' ? 'Dark' : 'Light';
    button.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }

  button.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* Private browsing: the choice just will not persist. */
    }
    render();
  });

  render();
  button.hidden = false;
})();
