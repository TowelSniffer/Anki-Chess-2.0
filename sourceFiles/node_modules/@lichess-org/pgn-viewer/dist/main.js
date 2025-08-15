import PgnViewer from './pgnViewer';
import view from './view/main';
import { init, attributesModule, classModule } from 'snabbdom';
import config from './config';
export default function start(element, cfg) {
    const patch = init([classModule, attributesModule]);
    const opts = config(element, cfg);
    const ctrl = new PgnViewer(opts, redraw);
    const blueprint = view(ctrl);
    element.innerHTML = '';
    let vnode = patch(element, blueprint);
    ctrl.div = vnode.elm;
    function redraw() {
        vnode = patch(vnode, view(ctrl));
    }
    return ctrl;
}
//# sourceMappingURL=main.js.map