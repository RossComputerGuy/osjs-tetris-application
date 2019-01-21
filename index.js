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
  let store = null;
  let intv = null;
  var blocksFromPreviousFrame;
  const render = () => {
    let blocks = SimpleTetris.matrixBlocksToRenderSelector(store.getState());
    let domElement;
    let html = '';
    let i;

    if (!blocksFromPreviousFrame) {
      for (i = 0; i < blocks.length; i++) {
        html += blocks[i] ? '<div class="filled"></div>' : '<div></div>';
      }
      elem.innerHTML = html;
    } else {
      for (i = 0; i < blocks.length; i++) {
        if (blocks[i] !== blocksFromPreviousFrame[i]) {
          domElement = elem.querySelector('div:nth-child(' + (i + 1) + ')');
          blocks[i]
            ? domElement.classList.add('filled')
            : domElement.classList.remove('filled');
        }
      }
    }
    blocksFromPreviousFrame = blocks;
  };
  const handleEvent = keyCode => {
    SimpleTetris.gameLoopIteration(store, new Date().getTime(), keyCode);
    requestAnimationFrame(render);
  };
  const run = () => {
    store = new SimpleTetris.createStore({ time: new Date().getTime() });
    intv = setInterval(handleEvent, SimpleTetris.TIME_STEP_DURATION);
    requestAnimationFrame(render);
  };
  proc.createWindow({
    id: 'TetrisWindow',
    title: _('WIN_TITLE'),
    dimension: {width: 250, height: 500},
    icon: proc.resource(proc.metadata.icon),
    attributes: {
      classNames: ['Window_Tetris'],
      minDimension: {width: 250, height: 500},
      maxDimension: {width: 250, height: 500},
      maximizable: false
    },
    position: 'center'
  }).on('destroy', () => {
    proc.destroy();
    clearInterval(intv);
  }).on('keydown', ev => {
    let keyCode = 0;
    if (ev.keyCode == 37) keyCode = SimpleTetris.KEY_CODE_LEFT;
    else if (ev.keyCode == 38) keyCode = SimpleTetris.KEY_CODE_ROTATE;
    else if (ev.keyCode == 39) keyCode = SimpleTetris.KEY_CODE_RIGHT;
    else if (ev.keyCode == 40) keyCode = SimpleTetris.KEY_CODE_HARD_DROP;
    handleEvent(keyCode);
  }).render($content => {
    app({},{},(state,actions) => h(Box,{ grow: 1, padding: false },[
      h('div', { oncreate: el => el.appendChild(elem) }, [])
    ]), $content);
    run();
  });
  return proc;
};

osjs.register(applicationName, register);
