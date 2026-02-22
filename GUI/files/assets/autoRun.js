window.addEventListener('click', (e) => {
  e.preventDefault();

  if (e.target.nodeName === 'A') {
    if (e.target.href.startsWith(`http://127.0.0.1:${port}/files/`)) {
      const url = `http://127.0.0.1:${port}/${e.target.href.substring(`http://127.0.0.1:${port}/files/`.length)}`;
      if (url.endsWith('.md') || url.endsWith('.Md') || url.endsWith('.mD') || url.endsWith('.MD')) {
        window.pywebview.api.openMD(undefined, url).then().catch(error => {
          console.error(error);
        });
      } else if (url.endsWith('/package/Marked/LICENSE')) {
        window.pywebview.api.openMD(undefined, url).then().catch(error => {
          console.error(error);
        });
      } else {
        window.pywebview.api.openFile(undefined, url).then().catch(error => {
          console.error(error);
        });
      }
    } else if (e.target.href.endsWith('.md') || e.target.href.endsWith('.Md') || e.target.href.endsWith('.mD') || e.target.href.endsWith('.MD')) {
      window.pywebview.api.openMD(undefined, e.target.href).then().catch(error => {
        console.error(error);
      });
    } else {
      window.pywebview.api.openURL(e.target.href);
    }
  }
});