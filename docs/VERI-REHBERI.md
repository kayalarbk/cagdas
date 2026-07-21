# Veri Rehberi

Kelime verisi tamamen `src/data/fields/` altında yaşar ve uygulama bu klasörü
manifest üzerinden okur. **Yeni bir alan eklemek için JavaScript'e dokunmak
gerekmez** — dosyayı koy, `npm run sync && npm run validate` çalıştır.

## Dosya düzeni

```
src/data/fields/
├── fields.json          # manifest: alan listesi + sayaçlar (script üretir)
├── gunluk-rutin.json    # alan dosyası (kategoriler → kartlar)
└── ...
```

Manifest tek kaynaktır; `src/data/fields.json` gibi ikinci bir kopya **yoktur**.

## Alan dosyası şeması

```json
{
  "id": "gunluk-rutin",
  "name": "Günlük Rutin",
  "icon": "🌅",
  "color": "#F59E0B",
  "description": "Sabahtan gece yatana kadar her gün kullandığın kalıplar.",
  "categories": [
    {
      "name": "Morning",
      "color": "#D9A441",
      "cards": [
        {
          "id": "gunluk-rutin-001",
          "en": "wake up",
          "enS": "I wake up at seven.",
          "tr": "uyanmak",
          "trS": "Ben yedide uyanırım."
        }
      ]
    }
  ]
}
```

Kart alanlarının tamamı zorunludur: `id`, `en`, `enS`, `tr`, `trS`, `level`
(örnekte `level` kısaltıldı — gerçek veride her kartta bulunur).

## Kurallar

| Kural | Neden |
|---|---|
| Dosya adı `{alanId}.json`, içindeki `id` ile aynı | manifest eşleştirmesi buna dayanır |
| Kart id'si `{alanId}-{3 haneli sıra}`, 1'den başlayıp kesintisiz | ilerleme anahtarı; boşluk olursa sonraki parti nereden devam edeceğini bilemez |
| Hiçbir alan id'si başka bir alan id'sinin öneki olamaz | alan ilerlemesi `"{alanId}-"` önekiyle sayılıyor (`ev` + `ev-doga` birbirine karışırdı) |
| `level` yalnızca `A1` / `A2` / `B1` / `B2` | seviye filtresi ve rozetler bu değerlere göre çalışır |
| Mevcut kartın `id`'si asla değişmez | id değişirse kullanıcının o kartı "öğrendim" kaydı sıfırlanır |
| `enS`, `en` kalıbını içermeli (çekim farkı olabilir) | quiz boşluk sorusu cümlede kalıbı bulup siliyor |
| Aynı `en` bir alanda iki kez geçmemeli | quiz seçeneklerinde ve kart listesinde tekrar olur |

Kart **metnini** düzeltmek serbesttir (id sabit kaldığı sürece ilerleme korunur).
Kart **silmek** numaralarda boşluk bırakır; bunun yerine düzeltmeyi tercih et.

## Yeni parti entegrasyonu

```bash
# 1. Yeni/güncellenmiş alan dosyalarını src/data/fields/ içine kopyala
# 2. Manifest'i verilerden yeniden üret
npm run sync
# 3. Doğrula (hata varsa çıkış kodu 1)
npm run validate
# 4. Uygulamayı aç ve yeni alanı gözle kontrol et
npm start
```

`npm run validate` çıktısı: alan/kart sayıları, seviye dağılımı, `✖` hatalar ve
`⚠` uyarılar. Uyarılar sürümü engellemez ama içerik kalitesine işaret eder
(aynı alanda tekrar eden kalıp, cümleyle ilgisiz görünen kalıp gibi).

## Meslek alanları ve tanışma testi

`src/js/config.js` içindeki `PROFILES`, testin ilk adımındaki bölüm/meslek
seçeneklerini ve her birinin **önerdiği alanları** tanımlar. Yeni bir meslek
alanı eklerken:

1. Alan dosyasını `src/data/fields/` içine koy, `npm run sync && npm run validate`.
2. İlgili profilin `fields` dizisine alanın id'sini ekle (ya da yeni bir profil tanımla).
3. Amaca bağlı öneri isteniyorsa `GOALS` içindeki uygun kaydın `fields` dizisine ekle.

Kod tarafında başka değişiklik gerekmez; anasayfa, keşfet listesi ve test
tamamen manifest + bu iki tablodan beslenir.

Hâlihazırdaki meslek alanları: `muhendislik`, `tip`, `ekonomi`, `hukuk`, `akademik`.

## Sonraki partiler için ayrılan alan kimlikleri

Planlanan yeni alanlar aşağıdaki id/ikon/renk ile gelmelidir; bu değerler
mevcut alanlarla çakışmayacak şekilde seçildi (önek çakışması yok, renkler
paletteki tonlardan ayrışıyor).

| Alan | id | icon | color |
|---|---|---|---|
| Araba & Sürüş | `araba-surus` | 🚗 | `#3B82F6` |
| Çocuk & Ebeveynlik | `cocuk-ebeveynlik` | 👶 | `#FB7185` |
| Sanat & Kültür | `sanat-kultur` | 🎨 | `#D946EF` |
| Phrasal Verbs | `phrasal-verbs` | 🔤 | `#0D9488` |

Mevcut alanlar derinleştirilirken yeni kartlar, o alandaki **son sıra
numarasından** devam etmelidir:

| Alan | son id | Alan | son id |
|---|---|---|---|
| `gunluk-rutin` | 156 | `medya-eglence` | 60 |
| `is-hayati` | 98 | `acil-guvenlik` | 44 |
| `egitim` | 87 | `resmi-islemler` | 39 |
| `seyahat` | 129 | `kisisel-gelisim` | 41 |
| `saglik-spor` | 91 | `akademik` | 24 |
| `yemek-alisveris` | 135 | `ekonomi` | 24 |
| `iliskiler` | 141 | `hukuk` | 24 |
| `ev-doga` | 84 | `muhendislik` | 24 |
| `finans-para` | 57 | `tip` | 24 |
| `iletisim` | 67 | | |

Hedef ~1800 kart; şu an 1349. Meslek alanları 24'er kartla başladı, önce onların
derinleştirilmesi öncelikli. B2 oranı %20 (hedef ~%25).
