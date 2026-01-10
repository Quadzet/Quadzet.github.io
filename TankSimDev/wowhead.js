"use strict";

export function refreshLinks() {
  let links = document.getElementsByTagName('a');
  Array.from(links).forEach(link => {
    link.classList.remove('q1');
    link.classList.remove('q2');
    link.classList.remove('q3');
    link.classList.remove('q4');
  })
  window.$WowheadPower.refreshLinks();
  Array.from(links).forEach(link => {
    link.classList.remove('q1');
  })
}

