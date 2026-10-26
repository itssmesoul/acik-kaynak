# WEBTE Açık Kaynaklar

My Library için provider deposu. CloudStream repo düzeninde: `repo.json` → `plugins.json` → `.js` provider.

Eklemek: Ayarlar → Add repo → `kullanici/depo-adi` (ya da GitHub bağlantısı).

## Yeni provider
1. `Ad/Ad.js` oluştur (`id`, `name`, `home`/`search`/`load`).
2. `plugins.json`'a bir kayıt ekle: `internalName` = provider `id`, `url` = dosya yolu. `status: 0` kaydı kapatır.

Yalnızca hakkına sahip olduğun ya da serbest lisanslı içerik ekle.
