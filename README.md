# Daily English

Günlük İngilizce kelime ve kalıpları çalışmak için hazırlanmış, bağımlılıksız bir
flashcard uygulaması. 19 alan ve 45 kategoride 1349 kart; her kartta örnek cümle,
Türkçe karşılık, CEFR seviyesi ve telaffuz desteği var. Mühendislik, tıp, ekonomi,
hukuk ve akademik İngilizce için ayrı alanlar içerir.

## Özellikler

- **Tanışma testi** — bölüm/meslek, seviye ve amacını sorar; alanları sana göre önerir
- **Kişiselleştirme** — mesleki alanlar (mühendislik, tıp, ekonomi, hukuk, akademik) ve
  "sana uygun" seviye filtresi; istediğin zaman yeni alan ekleyip çıkarabilirsin
- **Flashcard'lar** — karta dokun, İngilizce/Türkçe yüzler arasında çevir
- **Aralıklı tekrar (Leitner)** — Türkçesini görmeden "hatırlamadım / zor / kolay"
  dersin; kart kutular arasında gezer ve bir sonraki tekrar 1 · 3 · 7 · 16 · 35 gün
  sonrasına planlanır. Cevaba önce bakarsan "kolay" seçeneği kapanır.
- **Dört durum** — Yeni · Öğreniliyor · Pekişti · Kalıcı. Bir kart ancak ~2 hafta
  arayla hatırlanmayı sürdürürse "kalıcı" sayılır; tek dokunuşla öğrenilmiş olmaz.
- **Günün tekrarı** — anasayfada, tüm alanlardan vadesi gelmiş kartların tek destesi
- **CEFR seviyeleri** — her kartta A1–B2 rozeti; kartlar ekranında seviye filtresi
- **Telaffuz** — Web Speech API ile kelime ve örnek cümle seslendirme
- **Oyunlaştırma** — günlük hedef (çalışılan kart sayısı), seri (streak) ve XP
- **Quiz modu** — boşluk doldurma, anlam eşleştirme ve **yazma**; sonuçlar tekrar
  kayıtlarını da günceller. Çoktan seçmeli doğru cevap kartı en fazla "Pekişti"ye
  taşır — dört şıkta şansla bulmak kalıcılık kanıtı değildir; son adımı yazarak
  bilmek ya da kartta "kolay" demek açar.

## Çalıştırma

Uygulama ES modülleri kullandığı için `index.html` dosyasını çift tıklayarak açmak
yerine yerel bir sunucu üzerinden servis edilmelidir.

```bash
npm start
# veya
python -m http.server 8000
```

Ardından tarayıcıdan `http://localhost:8000` adresini aç.

## Klasör Yapısı

```
.
├── index.html                  # Uygulama kabuğu (beş ekranın işaretlemesi)
├── docs/VERI-REHBERI.md        # Veri şeması ve yeni parti entegrasyonu
├── tools/
│   ├── validate-data.mjs       # Veri doğrulama (npm run validate)
│   └── sync-manifest.mjs       # Manifest'i verilerden üretir (npm run sync)
└── src/
    ├── data/fields/            # Manifest (fields.json) + alan dosyaları
    ├── styles/main.css         # Tüm stiller
    └── js/
        ├── main.js             # Giriş noktası, olay bağlamaları
        ├── config.js           # Sabitler (seviyeler, quiz uzunluğu, depolama anahtarları)
        ├── dom.js              # DOM referansları
        ├── state.js            # Kartlar ekranının paylaşılan durumu
        ├── utils.js            # Karıştırma ve seslendirme yardımcıları
        ├── data/repository.js  # Manifest ve alan dosyalarının yüklenmesi
        ├── store/              # localStorage: profil, ilgi alanları, SRS, istatistik
        │   └── progress.js     # Aralıklı tekrar: kutu, vade, durum ve toplamlar
        ├── ui/                 # Üst bar ve bildirimler
        └── screens/            # onboarding · home · field · cards · quiz
```

## Kelime Ekleme

Kelime verisi `src/data/fields/` altındadır ve arayüz tamamen manifest'ten
beslenir — yeni bir alan eklemek için JavaScript'e dokunmak gerekmez:

```bash
# alan dosyasını src/data/fields/ içine koy, sonra:
npm run sync       # manifest'i (fields.json) verilerden yeniden üret
npm run validate   # şema, id ve sayaç kontrolü
```

Şema, id kuralları ve parti entegrasyon adımları için
[docs/VERI-REHBERI.md](docs/VERI-REHBERI.md).

## Veri Taşıma

Eski sürümlerin ilerleme kayıtları açılışta otomatik taşınır: `de_learned_v2`
(düz id listesi) ve daha eski `kartlar_learned_v1` (`"Kategori::kelime"`)
kayıtları, 2. kutuda ve bugün vadesi gelmiş SRS kayıtlarına dönüşür. Yani eski
"öğrendim" işaretleri kaybolmaz ama sıfırdan doğrulanır — ilk tekrar kartın
gerçekten hatırlanıp hatırlanmadığını ortaya çıkarır.

## Tarayıcı Desteği

ES modülleri ve `localStorage` destekleyen tüm güncel tarayıcılar. Telaffuz
özelliği Web Speech API bulunmayan tarayıcılarda sessizce devre dışı kalır.
