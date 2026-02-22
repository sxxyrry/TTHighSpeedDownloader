// ==================== 对话框脚本（使用 IIFE 隔离变量） ====================

// infoDialog
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    var dialog = document.getElementById('infoDialog');
    var closeDialogBtn = document.getElementById('closeDialog_info');
    
    if (window.vueApp) {
      window.vueApp.showInfoDialog = function() {
        dialog.showModal();
      };
    }
    
    closeDialogBtn.addEventListener('click', () => {
      dialog.close();
    });
    
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });
})();

// VersionHistoryDialog
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    var dialog = document.getElementById('VersionHistoryDialog');
    var closeDialogBtn = document.getElementById('closeDialog_VerHis');
    
    if (window.vueApp) {
      window.vueApp.showVersionHistoryDialog = function() {
        dialog.showModal();
      };
    }
    
    closeDialogBtn.addEventListener('click', () => {
      dialog.close();
    });
    
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });
})();

// READMEDialog
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    var dialog = document.getElementById('READMEDialog');
    var closeDialogBtn = document.getElementById('closeDialog_README');
    
    if (window.vueApp) {
      window.vueApp.showREADMEDialog = function() {
        const dialog_info = document.getElementById('infoDialog');
        if (dialog_info) {
          dialog_info.close();
        }
        dialog.showModal();
      };
    }
    
    closeDialogBtn.addEventListener('click', () => {
      dialog.close();
    });
    
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });
})();

// ConfigDialog
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    var dialog = document.getElementById('ConfigDialog');
    var closeDialogBtn = document.getElementById('closeDialog_Config');
    
    if (window.vueApp) {
      window.vueApp.showConfigDialog = function() {
        dialog.showModal();
      };
    }
    
    closeDialogBtn.addEventListener('click', () => {
      dialog.close();
      if (window.vueApp) {
        window.pywebview.api.save_Config(
          window.vueApp.ThreadCount,
          window.vueApp.chunkSizeMB,
          window.vueApp.UserAgent
        ).then(() => {
          window.showTip('配置已保存')
        }).catch(error => {
          console.error('保存配置失败:', error);
        });
      }
    });
    
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        if (window.vueApp) {
          window.pywebview.api.save_Config(
            window.vueApp.ThreadCount,
            window.vueApp.chunkSizeMB,
            window.vueApp.UserAgent
          ).then(() => {
            console.log('配置已保存');
          }).catch(error => {
            console.error('保存配置失败:', error);
          });
        }
        dialog.close();
      }
    });
  });
})();