// NASA Image and Video Library (images.nasa.gov). NASA görüntüleri genelde kamu malıdır;
// logolar ve üçüncü taraf içerikler için https://www.nasa.gov/nasa-brand-center/images-and-media/
const API = 'https://images-api.nasa.gov';
const https = (u) => String(u || '').replace(/^http:/, 'https:').replace(/ /g, '%20');

function toItem(it) {
  const d = (it.data && it.data[0]) || {};
  const thumb = (it.links || []).find((l) => l.rel === 'preview');
  return {
    id: d.nasa_id,
    title: d.title || d.nasa_id,
    year: (d.date_created || '').slice(0, 4),
    overview: String(d.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 800),
    poster: thumb ? https(thumb.href) : '',
    backdrop: thumb ? https(thumb.href) : '',
    genres: (d.keywords || []).slice(0, 3),
  };
}

async function find(ctx, q, size = 24) {
  const p = new URLSearchParams({ q, media_type: 'video', page_size: String(size) });
  const r = await ctx.getJSON(`${API}/search?${p}`);
  return ((r.collection && r.collection.items) || []).map(toItem).filter((i) => i.id);
}

const ORDER = ['~orig.mp4', '~large.mp4', '~medium.mp4', '~small.mp4', '~mobile.mp4', '~preview.mp4'];
const LABEL = { '~orig.mp4': 'Orijinal', '~large.mp4': 'Büyük', '~medium.mp4': 'Orta', '~small.mp4': 'Küçük', '~mobile.mp4': 'Mobil', '~preview.mp4': 'Önizleme' };

module.exports = {
  id: 'nasa-video',
  name: 'NASA Videoları',
  description: 'NASA Image and Video Library — kamu malı görüntüler',

  async home(ctx) {
    const rows = [['Apollo', 'apollo'], ['Uluslararası Uzay İstasyonu', 'international space station'], ['Mars', 'mars rover'], ['Roket Fırlatmaları', 'launch']];
    return Promise.all(rows.map(async ([title, q]) => ({ title, items: await find(ctx, q).catch(() => []) })));
  },

  async search(q, ctx) { return find(ctx, q, 40); },

  async load(id, ctx) {
    const [meta, asset] = await Promise.all([
      find(ctx, id, 5).then((a) => a.find((x) => x.id === id)).catch(() => null),
      ctx.getJSON(`${API}/asset/${encodeURIComponent(id)}`),
    ]);
    const files = ((asset.collection && asset.collection.items) || []).map((x) => x.href).filter((h) => /\.mp4$/i.test(h));
    const rank = (h) => { const i = ORDER.findIndex((s) => h.endsWith(s)); return i < 0 ? 99 : i; };
    return {
      ...(meta || { id, title: id }),
      streams: files.sort((a, b) => rank(a) - rank(b)).slice(0, 6).map((h) => ({ url: https(h), label: LABEL[ORDER[rank(h)]] || 'MP4' })),
    };
  },
};
