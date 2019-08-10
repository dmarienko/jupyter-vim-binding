/*
 * vim_binding.js
 *
 * A vim key binding plugin for Jupyter/IPython
 *
 * @author    Alisue <lambdalisue@hashnote.net>
 * @version   2.0.4
 * @license   MIT license
 * @see       http://github.com/lambdalisue/jupyter-vim-binding
 * @copyright 2015-2016, Alisue, hashnote.net
 *
 * Refs:
 *  - https://github.com/ivanov/ipython-vimception
 *  - http://stackoverflow.com/questions/25730516/vi-shortcuts-in-ipython-notebook
 *  - http://mindtrove.info/#nb-server-exts
 *  - http://akuederle.com/customize-ipython-keymap/
 */
define([
  'require',
  'jquery',
  'services/config',
  'base/js/namespace',
  'base/js/utils',
  'notebook/js/cell',
  './lib/codemirror',
  './lib/jupyter/actions',
  './lib/jupyter/codecell',
  './lib/jupyter/completer',
  './lib/jupyter/keyboard',
  './lib/jupyter/notebook',
  './lib/jupyter/shortcuts',
  './lib/jupyter/quickhelp',
], function(require, $, config, ns, utils, cell) {
  "use strict";
  var undefined;
  var exports = {};
  var modules = Array.prototype.slice.call(arguments, 6);
  var Cell = cell.Cell;
  var conf = new config.ConfigSection('notebook', {
    base_url: utils.get_body_data('baseUrl')
  });
  var params = {
    'scroll_unit': 30,
  };


  var require_css = function(url) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = require.toUrl(url);
    document.getElementsByTagName('head')[0].appendChild(link);
  };


  conf.loaded.then(function() {
    params = $.extend(params, conf.data);
    exports.attach();
  });

  exports.attach = function attach() {
    for(var i=0; i<modules.length; i++) {
      modules[i].attach(params);
    }
    // Include required CSS
    //require_css('./vim_binding.css');
    // Initialize
    var cm_config = Cell.options_default.cm_config;
    cm_config.keyMap = 'vim';
    cm_config.extraKeys = $.extend(cm_config.extraKeys || {}, {
      'Esc': CodeMirror.prototype.leaveInsertMode,
      'Shift-Esc': CodeMirror.prototype.leaveNormalMode,
      'Ctrl-C': false,  // To enable clipboard copy
    });

    // Apply default CodeMirror config to existing CodeMirror instances
    ns.notebook.get_cells().map(function(cell) {
      var cm = cell.code_mirror;
      if (cm) {
        cm.setOption('keyMap', cm_config.keyMap);
        cm.setOption('extraKeys', $.extend(
          cm.getOption('extraKeys') || {},
          cm_config.extraKeys
        ));
      }
    });

    for(var i=0; i<this.on_ready_callbacks.length; i++) {
      this.on_ready_callbacks[i](this);
    }
	
	// ------------------------------------------------------
    var km = ns.keyboard_manager;
    km.edit_shortcuts.add_shortcut('alt-j', 'jupyter-notebook:run-cell', true);
    km.edit_shortcuts.events.trigger('rebuild.QuickHelp');
	// ------------------------------------------------------

	// comment/uncomment
    CodeMirror.Vim.defineAction("toggle_comment_a", function(cm) {
        cm.toggleComment();
    });
    CodeMirror.Vim.mapCommand("\\", "action", "toggle_comment_a", {});

	 CodeMirror.Vim.map("jj", "<Esc>", "insert");
	 CodeMirror.Vim.map("jk", "<Esc>", "insert");
	  // Swap j/k and gj/gk (Note that <Plug> mappings)
	  CodeMirror.Vim.map("j", "<Plug>(vim-binding-gj)", "normal");
	  CodeMirror.Vim.map("k", "<Plug>(vim-binding-gk)", "normal");
	  CodeMirror.Vim.map("gj", "<Plug>(vim-binding-j)", "normal");
	  CodeMirror.Vim.map("gk", "<Plug>(vim-binding-k)", "normal");
  };


// ----------------------------------------------------------
	
CodeMirror.Vim.defineAction('[i]<C-h>', function(cm) {
  var head = cm.getCursor();
  CodeMirror.Vim.handleKey(cm, '<Esc>');
  if (head.ch <= 1) {
    CodeMirror.Vim.handleKey(cm, 'i');
  } else {
    CodeMirror.Vim.handleKey(cm, 'h');
    CodeMirror.Vim.handleKey(cm, 'a');
  }
});

CodeMirror.Vim.defineAction('[i]<C-l>', function(cm) {
  var head = cm.getCursor();
  CodeMirror.Vim.handleKey(cm, '<Esc>');
  if (head.ch === 0) {
    CodeMirror.Vim.handleKey(cm, 'a');
  } else {
    CodeMirror.Vim.handleKey(cm, 'l');
    CodeMirror.Vim.handleKey(cm, 'a');
  }
});

CodeMirror.Vim.mapCommand("<C-h>", "action", "[i]<C-h>", {}, { "context": "insert" });
CodeMirror.Vim.mapCommand("<C-l>", "action", "[i]<C-l>", {}, { "context": "insert" });
CodeMirror.Vim.map("<C-j>", "<Esc>ja", "insert");
CodeMirror.Vim.map("<C-k>", "<Esc>ka", "insert");

// Use Ctrl-h/l/j/k to move around in Normal mode
// otherwise it would trigger browser shortcuts
CodeMirror.Vim.map("<C-h>", "h", "normal");
CodeMirror.Vim.map("<C-l>", "l", "normal");
//CodeMirror.Vim.map("<C-j>", "j", "normal");
//CodeMirror.Vim.map("<C-k>", "k", "normal");

  exports.detach = function detach() {
    for(var i=0; i<modules.length; i++) {
      modules[i].detach(params);
    }
  };

  exports.load_ipython_extension = function load_ipython_extension() {
    conf.load();
  };

  // Assumed to used in 'custom.js'
  exports.on_ready_callbacks = [];

  return exports;
});


