// ==================== Vue 应用及其他全局函数 ====================

const port = window.location.port;

const { createApp, ref } = Vue;

const version = ref('');
const versionHistory = ref('');
const ThreadCount = ref(64);
window.ThreadCount = ThreadCount;
const chunkSizeMB = ref(10);
window.chunkSizeMB = chunkSizeMB;
const UserAgent = ref('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0');
window.UserAgent = UserAgent;
const README = ref('');
const KernelVersion = ref('');

// 全局进度更新处理函数
function handleProgressUpdate(data) {
  if (window.vueApp) {
    window.vueApp.handleProgressUpdate(data);
  }
}

const app = createApp({
  data() {
    return {
      tasks: [],
      downloaderID: -1,
      downloadStarted: false,
      downloadCompleted: false,
      overallProgress: 0,
      overallSpeed: 0,
      estimatedTimeRemaining: 0,
      taskIndexMap: {},
      version: '加载中...',
      versionLog: '加载中...',
      README: '加载中...',
      KernelVersion: '加载中...',
      loadingVersion: true,
      loadingVersionLog: true,
      loadingREADME: true,
      loadingVersionHistory: true,
      ThreadCount: 64,
      chunkSizeMB: 10,
      UserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
      lastUpdateTime: Date.now(),
      lastDownloadedBytes: 0
    };
  },
  computed: {
    canStartDownload() {
      return this.tasks.some(task => task.url && task.savePath);
    }
  },
  methods: {
    minimize() {
      window.pywebview.api.minimize();
    },
    maximize() {
      window.pywebview.api.maximize();
    },
    exit() {
      window.pywebview.api.exit(0);
    },
    selectSavePath(index) {
      window.pywebview.api.selectPath({
        title: '选择文件保存路径',
        defaultPath: this.tasks[index].savePath || ''
      }).then(result => {
        if (result.selectedPath) {
          const currentUrl = this.tasks[index].url;
          if (currentUrl) {
            const filename = this.getFilenameFromUrl(currentUrl);
            const pathParts = result.selectedPath.split(/[\/\\]/);
            const lastPart = pathParts[pathParts.length - 1];
            
            if (lastPart && lastPart.includes('.')) {
              this.tasks[index].savePath = result.selectedPath;
            } else {
              const separator = result.selectedPath.endsWith('/') || result.selectedPath.endsWith('\\') ? '' : '/';
              this.tasks[index].savePath = result.selectedPath + separator + filename;
            }
          } else {
            this.tasks[index].savePath = result.selectedPath;
          }
          this.tasks[index].error = null;
        } else if (result.msg) {
          this.tasks[index].error = result.msg;
          console.log(result.msg);
        }
      }).catch(error => {
        console.error('选择保存路径时出错:', error);
        this.tasks[index].error = '选择保存路径失败: ' + error.message;
      });
    },
    getFilenameFromUrl(url) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        let filename = pathname.split('/').pop();
        
        if (filename && filename.includes('.')) {
          filename = filename.replace(/[<>:"/\\|?*]/g, '_');
          return filename;
        }
        
        const params = new URLSearchParams(urlObj.search);
        for (const param of ['filename', 'file', 'name', 'download', 'path']) {
          if (params.has(param)) {
            let paramValue = params.get(param);
            paramValue = paramValue.split('/').pop().split('\\').pop();
            if (paramValue && paramValue.includes('.')) {
              paramValue = paramValue.replace(/[<>:"/\\|?*]/g, '_');
              return paramValue;
            }
          }
        }
        
        if (pathname !== '/') {
          const pathParts = pathname.split('/');
          for (let i = pathParts.length - 1; i >= 0; i--) {
            const part = pathParts[i];
            if (part && part.includes('.')) {
              const cleanPart = part.replace(/[<>:"/\\|?*]/g, '_');
              return cleanPart;
            }
          }
        }
        
        return 'downloaded_file';
      } catch (e) {
        try {
          let cleanUrl = url.split('?')[0].split('#')[0];
          let filename = cleanUrl.split('/').pop();
          
          if (filename && filename.includes('.')) {
            filename = filename.replace(/[<>:"/\\|?*]/g, '_');
            return filename;
          }
          
          const urlParts = url.split('/');
          for (let i = urlParts.length - 1; i >= 0; i--) {
            const part = urlParts[i];
            if (part && part.includes('.')) {
              let cleanPart = part.split('?')[0].split('#')[0];
              cleanPart = cleanPart.replace(/[<>:"/\\|?*]/g, '_');
              return cleanPart;
            }
          }
          
          return 'downloaded_file';
        } catch (e2) {
          return 'downloaded_file';
        }
      }
    },
    updateSavePath(index) {
      const task = this.tasks[index];
      if (task.url) {
        if (task.savePath) {
          const pathParts = task.savePath.split(/[\/\\]/);
          const lastPart = pathParts[pathParts.length - 1];
          
          if (lastPart && lastPart.includes('.')) {
            const currentFilename = lastPart;
            const newFilename = this.getFilenameFromUrl(task.url);
            
            if (currentFilename !== newFilename && 
                currentFilename !== 'downloaded_file' && 
                !task.savePath.endsWith('/' + newFilename) && 
                !task.savePath.endsWith('\\' + newFilename)) {
            }
          } else {
            const filename = this.getFilenameFromUrl(task.url);
            if (filename && filename !== 'downloaded_file') {
              const separator = task.savePath.endsWith('/') || task.savePath.endsWith('\\') ? '' : '/';
              task.savePath = task.savePath + separator + filename;
            } else if (!task.savePath) {
              task.savePath = filename;
            }
          }
        } else {
          const filename = this.getFilenameFromUrl(task.url);
          if (filename && filename !== 'downloaded_file') {
            task.savePath = filename;
          } else if (!task.savePath) {
            task.savePath = filename;
          }
        }
      }
    },
    showInfoDialog() {
      const dialog = document.getElementById('infoDialog');
      if (dialog) {
        dialog.showModal();
      }
    },
    showVersionHistoryDialog() {
      const dialog = document.getElementById('VersionHistoryDialog');
      if (dialog) {
        dialog.showModal();
      }
    },
    showConfigDialog() {
      const dialog = document.getElementById('ConfigDialog');
      if (dialog) {
        dialog.showModal();
      }
    },
    showREADMEDialog() {
      const dialog_info = document.getElementById('infoDialog');
      if (dialog_info) {
        dialog_info.close();
      }
      const dialog = document.getElementById('READMEDialog');
      if (dialog) {
        dialog.showModal();
      }
    },
    addTask() {
      const newTask = {
        url: '',
        savePath: '',
        status: 'pending',
        progress: 0,
        downloaded: 0,
        total: 0,
        speed: 0,
        remainingTime: 0,
        error: null,
        id: Date.now() + Math.random().toString(36).substr(2, 9)
      };
      
      this.tasks.push(newTask);
      
      this.$nextTick(() => {
        this.updateTaskItemWidths();
      });
    },
    updateTaskItemWidths() {
      const taskListInner = document.querySelector('.task-list-inner');
      if (taskListInner) {
        const gap = 10;
        const columns = Math.max(Math.floor(taskListInner.clientWidth / 250), 1);
        const totalGaps = (columns - 1) * gap;
        const columnWidth = (taskListInner.clientWidth - totalGaps) / columns;
        
        const taskItems = document.querySelectorAll('.task-item');
        taskItems.forEach(item => {
          if (columnWidth > 0) {
            item.style.maxWidth = columnWidth + 'px';
            item.style.width = 'auto';
          } else {
            item.style.maxWidth = '15vw';
          }
        });
      }
    },
    removeTask(index) {
      this.tasks.splice(index, 1);
    },
    clearAllTasks() {
      this.tasks = [];
    },
    startAllDownloads() {
      if (this.tasks.length === 0) return;
      const validTasks = this.tasks.filter(task => task.url && task.savePath);
      
      if (validTasks.length === 0) return;
      
      this.downloadStarted = true;
      this.downloadCompleted = false;
      this.overallProgress = 0;
      this.overallSpeed = 0;
      this.estimatedTimeRemaining = 0;
      this.lastUpdateTime = Date.now();
      this.lastDownloadedBytes = 0;
      
      validTasks.forEach(task => {
        task.status = 'pending';
        task.progress = 0;
        task.downloaded = 0;
        task.total = 0;
        task.speed = 0;
        task.remainingTime = 0;
        task.error = null;
      });
      
      const urls = validTasks.map(task => task.url);
      const savePaths = validTasks.map(task => task.savePath);
      
      let this_ = this;

      window.pywebview.api.download(urls, savePaths).then(ID => {
        this_.downloaderID = ID;
      });
    },
    cancelAllDownloads() {
      this.downloadStarted = false;
      this.downloadCompleted = false;
      window.pywebview.api.cancel_download(this.downloaderID).then(rep => {
        const { success, message } = rep;
        console.log(success, message);
        setTimeout(() => {
          this.updateTaskItemWidths();
        }, 10);
      });
      setTimeout(() => {
        this.updateTaskItemWidths();
      }, 10);
    },
    resetDownload() {
      this.downloadStarted = false;
      this.downloadCompleted = false;
      this.overallProgress = 0;
      this.overallSpeed = 0;
      this.estimatedTimeRemaining = 0;
      
      this.tasks.forEach(task => {
        task.status = 'pending';
        task.progress = 0;
        task.downloaded = 0;
        task.total = 0;
        task.speed = 0;
        task.remainingTime = 0;
        task.error = null;
      });
      setTimeout(() => {
        this.updateTaskItemWidths();
      }, 10);
    },
    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    formatSpeed(speed) {
      return this.formatBytes(speed) + '/s';
    },
    formatTime(seconds) {
      if (seconds <= 0) return '0秒';
      
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      let result = '';
      if (hours > 0) result += hours + '小时';
      if (minutes > 0) result += minutes + '分钟';
      if (secs > 0 && hours === 0) result += secs + '秒';
      
      return result || '0秒';
    },
    getTaskStatusClass(status) {
      return status;
    },
    getTaskStatusText(status) {
      switch (status) {
        case 'pending': return '待下载';
        case 'downloading': return '下载中';
        case 'completed': return '已完成';
        case 'error': return '错误';
        default: return '未知';
      }
    },
    updateOverallProgress() {
      if (this.tasks.length === 0) {
        this.overallProgress = 0;
        this.overallSpeed = 0;
        this.estimatedTimeRemaining = 0;
        return;
      }
      
      const validTasks = this.tasks.filter(task => task.status !== 'pending' && task.status !== 'error');
      if (validTasks.length === 0) {
        this.overallProgress = 0;
        this.overallSpeed = 0;
        this.estimatedTimeRemaining = 0;
        return;
      }
      
      const currentTime = Date.now();
      const timeDiff = (currentTime - this.lastUpdateTime) / 1000;
      
      const totalDownloaded = validTasks.reduce((sum, task) => sum + task.downloaded, 0);
      const totalSize = validTasks.reduce((sum, task) => sum + task.total, 0);
      
      if (timeDiff > 0) {
        const downloadedDiff = totalDownloaded - this.lastDownloadedBytes;
        this.overallSpeed = downloadedDiff / timeDiff;
        
        this.lastDownloadedBytes = totalDownloaded;
        this.lastUpdateTime = currentTime;
      }
      
      this.overallProgress = totalSize > 0 ? (totalDownloaded / totalSize) * 100 : 0;
      
      const remainingBytes = totalSize - totalDownloaded;
      if (this.overallSpeed > 0 && remainingBytes > 0) {
        this.estimatedTimeRemaining = remainingBytes / this.overallSpeed;
      } else {
        this.estimatedTimeRemaining = 0;
      }
      
      validTasks.forEach(task => {
        if (task.status === 'downloading' && task.speed > 0) {
          const taskRemainingBytes = task.total - task.downloaded;
          if (taskRemainingBytes > 0) {
            task.remainingTime = taskRemainingBytes / task.speed;
          } else {
            task.remainingTime = 0;
          }
        }
      });
      
      const allCompleted = this.tasks.every(task => task.status === 'completed' || task.status === 'error');
      if (allCompleted && this.tasks.length > 0) {
        this.downloadCompleted = true;
      }
    },
    handleProgressUpdate(data) {
      console.log('收到进度更新:', data);
      
      try {
        const type = data.type;
        const msgData = data.data || {};
        
        switch (type) {
          case 'start':
            this.tasks.forEach(task => {
              if (task.url && task.savePath) {
                task.status = 'downloading';
              }
            });
            break;
            
          case 'startOne':
            const index = msgData.Index - 1;
            if (index >= 0 && index < this.tasks.length) {
              this.tasks[index].status = 'downloading';
              this.tasks[index].total = msgData.Total || 0;
              this.tasks[index].error = null;
            }
            break;
            
          case 'update':
            const progress = data.progress;
            if (progress) {
              const taskId = msgData.ID;
              const task = this.tasks.find(t => t.id === taskId);
              
              if (task) {
                const currentTime = Date.now();
                const timeDiff = (currentTime - (task.lastUpdateTime || currentTime)) / 1000;
                const downloadedDiff = progress.downloaded - task.downloaded;
                
                if (timeDiff > 0 && downloadedDiff > 0) {
                  task.speed = downloadedDiff / timeDiff;
                } else if (timeDiff <= 0) {
                  task.speed = task.speed * 0.7 + (downloadedDiff / 1) * 0.3;
                }
                
                task.lastUpdateTime = currentTime;
                task.downloaded = progress.downloaded;
                task.total = progress.total;
                if (progress.total > 0) {
                  task.progress = (progress.downloaded / progress.total) * 100;
                }
              } else {
                const downloadingTask = this.tasks.find(task => task.status === 'downloading');
                if (downloadingTask) {
                  downloadingTask.downloaded = progress.downloaded;
                  downloadingTask.total = progress.total;
                  downloadingTask.speed = progress.speed || downloadingTask.speed;
                  if (progress.total > 0) {
                    downloadingTask.progress = (progress.downloaded / progress.total) * 100;
                  }
                }
              }
            }
            break;
            
          case 'endOne':
            const endIndex = msgData.Index - 1;
            if (endIndex >= 0 && endIndex < this.tasks.length) {
              this.tasks[endIndex].status = 'completed';
              this.tasks[endIndex].progress = 100;
              this.tasks[endIndex].speed = 0;
              this.tasks[endIndex].remainingTime = 0;
            }
            break;
            
          case 'end':
            this.downloadCompleted = true;
            break;
            
          case 'error':
            const errorTaskId = msgData.ID;
            const errorTask = this.tasks.find(t => t.id === errorTaskId);
            if (errorTask) {
              errorTask.error = msgData.Text || data.message || '未知错误';
              errorTask.status = 'error';
            } else {
              if (this.tasks.length > 0) {
                this.tasks[0].error = msgData.Text || data.message || '未知错误';
              }
            }
            break;
            
          case 'msg':
            if (msgData.Text && (msgData.Text.includes('错误') || msgData.Text.includes('失败'))) {
              const msgTaskId = msgData.ID;
              const msgTask = this.tasks.find(t => t.id === msgTaskId);
              if (msgTask) {
                msgTask.error = msgData.Text;
              } else {
                if (this.tasks.length > 0) {
                  this.tasks[0].error = msgData.Text;
                }
              }
            }
            break;
        }
        
        this.updateOverallProgress();
        
      } catch (error) {
        console.error('处理进度更新时出错:', error);
      }
    }
  },
  watch: {
    tasks: {
      handler() {
        this.updateOverallProgress();
      },
      deep: true
    }
  },
  mounted() {
    window.vueApp = this;
    window.addEventListener('resize', (e) => {
      this.updateTaskItemWidths();
    });
  },
  beforeUnmount() {
    window.vueApp = null;
  }
});

app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('s-');
};

app.mount('#app');

// ==================== initializeAPI 函数及调用 ====================

function initializeAPI() {
  if (window.pywebview && window.pywebview.api) {
    if (!(typeof window.pywebview.api.get_Version === 'function' &&
      typeof window.pywebview.api.get_VersionHistory === 'function' &&
      typeof window.pywebview.api.get_README === 'function' &&
      typeof window.pywebview.api.get_KernelVersion === 'function')) {
      setTimeout(initializeAPI, 100);
      return;
    }

    window.pywebview.api.get_Version().then(version_ => {
      if (window.vueApp) {
        window.vueApp.version = version_;
        document.getElementById('version').innerText = window.vueApp.version;
        window.vueApp.loadingVersion = false;
      }
    }).catch(error => {
      if (window.vueApp) {
        window.vueApp.version = '未知版本';
        document.getElementById('version').innerText = window.vueApp.version;
        window.vueApp.loadingVersion = false;
      }
    });
    
    window.pywebview.api.get_VersionHistory().then(versionHistory_ => {
      if (window.vueApp) {
        window.vueApp.versionHistory = versionHistory_;
        document.getElementById('VersionHistory').innerText = window.vueApp.versionHistory;
        window.vueApp.loadingVersionHistory = false;
      }
    }).catch(error => {
      if (window.vueApp) {
        window.vueApp.versionLog = '未知版本历史';
        document.getElementById('VersionHistory').innerText = window.vueApp.versionLog;
        window.vueApp.loadingVersionHistory = false;
      }
    });

    window.pywebview.api.get_KernelVersion().then(KernelVersion_ => {
      if (window.vueApp) {
        window.vueApp.KernelVersion = KernelVersion_;
        document.getElementById('KernelVersion').innerText = window.vueApp.KernelVersion;
        window.vueApp.loadingKernelVersion = false;
      }
    }).catch(error => {
      if (window.vueApp) {
        window.vueApp.KernelVersion = '未知版本';
        document.getElementById('KernelVersion').innerText = window.vueApp.KernelVersion;
        window.vueApp.loadingKernelVersion = false;
      }
    });

    window.pywebview.api.get_README().then(README => {
      if (window.vueApp) {
        window.vueApp.README = README;
        const renderer = new marked.Renderer();
        const originalImageRenderer = renderer.image;
        renderer.image = function(img, title, text) {
          let href = img.href;
          if (href && typeof href === 'string' && !href.startsWith('http') && href.startsWith('./files/images/')) {
            img.href = './' + href.substring('./files/'.length);
          }
          return originalImageRenderer.call(this, img, title, text);
        };
        document.getElementById('README').innerHTML = marked.parse(window.vueApp.README, { renderer: renderer });
        window.vueApp.loadingREADME = false;
      }
    }).catch(error => {
      console.error('加载 README 失败:', error);
      if (window.vueApp) {
        window.vueApp.README = '未知 README';
        document.getElementById('README').innerHTML = marked.parse(window.vueApp.README);
        window.vueApp.loadingREADME = false;
      }
    });

    document.getElementById('version').innerText = '加载中...';
    document.getElementById('VersionHistory').innerText = '加载中...';
    document.getElementById('README').innerText = '加载中...';
    document.getElementById('KernelVersion').innerText = '加载中...';
    // document.getElementById('ThreadCount_t').innerText = '加载中...';
    // document.getElementById('chunkSizeMB_t').innerText = '加载中...';
    // document.getElementById('UserAgent_t').innerText = '加载中...';

    if (window.pywebview && window.pywebview.api) {
      window.pywebview.api.get_Config().then(config => {
        this.ThreadCount = config.thread_count || 64;
        this.chunkSizeMB = config.chunk_size_mb || 10;
        this.UserAgent = config.UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0';
        window.ThreadCount.value = this.ThreadCount;
        window.chunkSizeMB.value = this.chunkSizeMB;
        this.UserAgent.value = this.UserAgent;
        document.getElementById('ThreadCount_t').textContent = `${this.ThreadCount}`;
        document.getElementById('chunkSizeMB_t').textContent = `${this.chunkSizeMB}`;
        document.getElementById('UserAgent_t').textContent = `${this.UserAgent}`;
      }).catch(error => {
        console.error('加载配置失败:', error);
      });
    }
  } else {
    setTimeout(initializeAPI, 100);
  }
}

document.addEventListener('DOMContentLoaded', initializeAPI);