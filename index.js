import {app,h} from 'hyperapp';
import osjs from 'osjs';
import {Box,BoxContainer} from '@osjs/gui';
import {name as applicationName} from './metadata.json';
const SimpleTetris = require('simple-tetris');

const register = (core, args, options, metadata) => {
  const proc = core.make('osjs/application', {args, options, metadata});
  const {translatable} = core.make('osjs/locale');
  const _ = translatable(require('./locales.js'));
  let elem = document.createElement('div');
  elem.classList.add('game-root');
  let store = new SimpleTetris.createStore();
  const render = () => {
    let matrixBlocksToRender = SimpleTetris.matrixBlocksToRenderSelector(store.getState());
    let html = '';
    for (let matrixBlockToRender of matrixBlocksToRender) html += matrixBlockToRender ? '<div class="filled"></div>' : '<div></div>';
    elem.innerHTML = html;
  };
  render();
  proc.createWindow({
    id: 'TetrisWindow',
    title: _('WIN_TITLE'),
    dimension: {width: 240, height: 480},
    position: 'center'
  }).on('destroy', () => {
    proc.destroy();
  }).on('keydown', ev => {
    let keyCode = 0;
    if (ev.keyCode == 37) keyCode = SimpleTetris.KEY_CODE_LEFT;
    else if (ev.keyCode == 38 || ev.keyCode == 40) keyCode = SimpleTetris.KEY_CODE_ROTATE;
    else if (ev.keyCode == 39) keyCode = SimpleTetris.KEY_CODE_RIGHT;
    else if (ev.keyCode == 32) keyCode = SimpleTetris.KEY_CODE_HARD_DROP;
    SimpleTetris.gameLoopIteration(store, 0.0, keyCode);
    render();
  }).render($content => {
    app({},{},(state,actions) => h(Box,{ grow: 1, padding: false },[
      h('div', { oncreate: el => el.appendChild(elem) }, [])
    ]), $content);
  });
  return proc;
};

osjs.register(applicationName, register);
