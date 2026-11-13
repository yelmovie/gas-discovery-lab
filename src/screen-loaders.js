const styles = new Map();
function style(name, anchor = 'screen-style-anchor') {
  if (styles.has(name)) return styles.get(name);
  const promise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL(name, import.meta.url);
    link.onload = resolve;
    link.onerror = () => {
      styles.delete(name);
      link.remove();
      reject(new Error(`Stylesheet unavailable: ${name}`));
    };
    document.head.insertBefore(link, document.getElementById(anchor));
  });
  styles.set(name, promise);
  return promise;
}

const activities = {
  flow: [() => import('./activities/flow.js'), 'mountFlow', './flow-weight-visuals.css'],
  weight: [() => import('./activities/weight.js'), 'mountWeight', './flow-weight-visuals.css'],
  climate: [() => import('./activities/climate.js'), 'mountClimate', './climate-visuals.css'],
  delivery: [() => import('./activities/delivery.js'), 'mountDelivery', './delivery-visuals.css'],
  engineering: [() => import('./activities/engineering.js'), 'mountEngineering', './engineering-visuals.css'],
};
export async function loadActivity(id) {
  const [load, mount, css] = activities[id];
  const [activity, player] = await Promise.all([load(), import('./experiment-player.js'), style(css), loadConceptVisuals()]);
  return { mount: activity[mount], mountPlayer: player.mountExperimentPlayer };
}
export async function loadPlayMission() {
  const [module] = await Promise.all([import('./play-mission.js'), style('./play-mission.css')]);
  return module.openPlayMission;
}

export function waitForScreen(pending, signal, deadline = 10000) {
  return new Promise((resolve, reject) => {
    const finish = settle => value => {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      settle(value);
    };
    const fail = finish(reject);
    const cancel = () => fail(signal.reason);
    const timer = setTimeout(() => fail(new Error('Screen load timed out')), deadline);
    if (signal.aborted) cancel();
    else signal.addEventListener('abort', cancel, { once: true });
    pending.then(finish(resolve), fail);
  });
}

export async function loadMapAssets(soliImage, signal) {
  const request = new AbortController();
  const cancel = () => request.abort();
  if (signal.aborted) cancel();
  else signal.addEventListener('abort', cancel, { once: true });
  const json = async url => {
    const response = await fetch(url, { signal: request.signal });
    if (!response.ok) throw new Error(url);
    return response.json();
  };
  const image = async (src, priority = 'auto') => {
    const picture = new Image();
    picture.fetchPriority = priority;
    picture.src = src;
    const detach = () => picture.removeAttribute('src');
    if (request.signal.aborted) detach();
    else request.signal.addEventListener('abort', detach, { once: true });
    try { await picture.decode(); return picture; }
    finally { request.signal.removeEventListener('abort', detach); }
  };
  try {
    return await waitForScreen(Promise.all([
      json('/assets/world-map.json'), image('/assets/village.webp', 'high'),
      image('/assets/student-walk.webp'), image(soliImage), json('/assets/sprite-manifest.json'),
    ]), request.signal, 20000);
  } finally {
    signal.removeEventListener('abort', cancel);
    request.abort();
  }
}

export function loadConceptVisuals(){return style('./concept-visuals.css','concept-visuals-anchor');}
