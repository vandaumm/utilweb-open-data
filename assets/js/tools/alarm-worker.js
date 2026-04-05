// Este código roda em uma thread separada e não é pausado pelo navegador
setInterval(() => {
    self.postMessage('tick');
}, 1000);