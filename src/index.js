import Engine from './engine.js';

function main() {
    window.engine = new Engine(document.getElementById('canvas'));
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', main) : main();
