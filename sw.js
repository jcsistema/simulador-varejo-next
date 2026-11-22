// Service worker da copia de teste. O prefixo "nxv-" nao pode comecar com "simulador-": o oficial apaga os caches com esse prefixo.
var CACHE = "nxv-10-teste-3";
var ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(ARQUIVOS.map(function(u){ return fetch(u, {cache:"reload"}).then(function(r){ if(!r.ok) throw new Error(u); return c.put(u, r); }); }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k.indexOf("nxv-")===0 && k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  if(e.request.method!=="GET") return;
  var url = new URL(e.request.url);
  if(url.origin!==location.origin || url.pathname.indexOf("/api/")>=0) return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(e.request, {ignoreSearch:true}).then(function(r){
      return r || fetch(e.request).catch(function(){ return c.match("./index.html"); });
    });
  }));
});
