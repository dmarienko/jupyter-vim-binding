import { JupyterFrontEndPlugin } from '@jupyterlab/application';
import '../style/index.css';
import 'codemirror/keymap/vim.js';
/**
 * Initialization data for the jupyterlab_vim extension.
 */
declare const extension: JupyterFrontEndPlugin<void>;
export default extension;
