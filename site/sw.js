/* RoleHint Release 1: network-first documents; versioned offline shell. */
const CACHE='rolehint-onboarding-release-2';
const ASSETS=['./','./index.html','./favicon.svg','./privacy.html','./thanks.html','./design-system.css','./landing.css','./lilac-polish.css','./motion-stability.css','./early-access.css','./product-preview.css','./design-lock.css','./silver-restore.css','./release-v1.css','./release-v1.js','./early-access.js','./install.html','./workspace.html','./workbench.js','./workbench.css','./onboarding-inline.js','./onboarding-3d.css','./ux-flow.js','./ux-flow.css','./typography.css','./tokens.css','./start-install.css','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>caches.match(event.request)))});
