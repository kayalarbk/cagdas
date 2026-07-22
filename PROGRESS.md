# PROGRESS — Proje Hafızası

> **Bu dosya projenin hafızasıdır. Her güncelleme, yeni özellik, bug fix veya
> teknik karar sonrasında bu dosya GÜNCELLENMELİDİR. Güncelleme yapılmadan iş
> "bitti" sayılmaz.**

**Çalışma akışı:**

1. Her oturumun başında önce bu dosya okunur, kaldığın yerden devam edilir.
2. İş bitince PROGRESS.md güncellenir.
3. PROGRESS.md ve ilgili kod değişiklikleri **birlikte** commit edilir ve
   push'lanır. Commit mesajı: `feat: …` / `fix: …` / `docs: …`
4. Push yapılmadan görev tamamlanmış sayılmaz.

---

## Proje Özeti

**Daily English** — ilgi alanına göre İngilizce kelime ve kalıp çalıştıran,
bağımlılıksız (framework yok, build adımı yok) bir flashcard uygulaması.
19 alan, 45 kategori, 1349 kart; her kartta örnek cümle, Türkçe karşılık,
CEFR seviyesi ve telaffuz.

**Amaç:** Kullanıcının kelimeleri *gerçekten* öğrenmesi — görmesi değil.
Bu yüzden uygulamanın merkezinde aralıklı tekrar (spaced repetition) var.

**Referans dokümanlar:**

- `SPEC.md` — **henüz yok** (bkz. TODO). Ürün gereksinimleri şu an README ve
  bu dosya arasında dağılmış durumda.
- `README.md` — kullanıcıya dönük özellik listesi, kurulum, klasör yapısı
- `docs/VERI-REHBERI.md` — veri şeması, id kuralları, yeni kelime partisi ekleme

---

## Tamamlanan İşler

Tarihler commit tarihleridir.

### 2026-07-05 — İlk sürüm

- Tek dosyalık HTML flashcard uygulaması (`index.html`), gömülü kelime listesi.

### 2026-07-07 / 2026-07-15 — İçerik büyütme

- Kelime listesi partiler hâlinde genişletildi.

### 2026-07-20 — Modüler yapıya geçiş

- Tek dosya, ES modüllerine bölündü: `src/js/` altında `store`, `screens`,
  `ui`, `data` katmanları; veri `src/data/fields/` altında JSON dosyalarına
  taşındı. Artık yerel sunucu gerekiyor (ES modülleri `file://` ile çalışmaz).

### 2026-07-21 — Seviyeler, veri araçları, içerik

- Her karta CEFR seviyesi (A1–B2) ve rozet; kartlar ekranında seviye filtresi.
- İlerleme takibi kart metnine değil **kalıcı kart id'sine** bağlandı
  (`gunluk-rutin-101`) — metin değişse bile ilerleme korunuyor.
- `tools/validate-data.mjs` (şema/id/sayaç doğrulama) ve
  `tools/sync-manifest.mjs` (manifest üretimi) eklendi.
- İçerik: tekrar eden kalıplar temizlendi, B2 ve günlük kalıplar artırıldı.

### 2026-07-22 — Kişiselleştirme

- Tanışma testi (bölüm/meslek → seviye → amaç), profile göre alan önerisi,
  "⭐ Sana uygun" seviye filtresi, alan ekle/çıkar ekranı.

### 2026-07-22 — Aralıklı tekrar (SRS) — **büyük değişiklik**

Sorun: "Öğrendim" butonu kartın **arka** yüzündeydi. Kullanıcı Türkçe karşılığı
gördükten sonra basıyordu; ölçülen şey hatırlama değil *tanıma* idi. İlerleme
ikili (öğrenildi/öğrenilmedi) tutuluyordu, zaman boyutu yoktu.

Yapılanlar:

1. **Değerlendirme kartın ön yüzüne alındı.** Cevap görülmeden üç seçenek:
   Hatırlamadım / Zor hatırladım / Kolay (klavye: 1-2-3). Seçince kart cevabı
   göstermek için kendiliğinden dönüyor.
   - **Dürüstlük kilidi:** kullanıcı değerlendirmeden önce kartı çevirirse
     ("peek") "Kolay" seçeneği kapanıyor.
2. **Leitner kutuları.** Kart başına kayıt: `{box, due, seen, correct, lapses,
   last}`. Aralıklar `0 · 1 · 3 · 7 · 16 · 35` gün. Kutu ≥ 4 → "Kalıcı".
   Dört durum: **Yeni → Öğreniliyor → Pekişti → Kalıcı**.
3. **Quiz artık ölçüyor.** Doğru cevap kutuyu ilerletiyor, yanlış cevap
   sıfırlıyor (kart aynı gün kuyruğa dönüyor). Yeni **yazma modu** (TR → EN
   yazdırma) eklendi.
4. **"Bugünün tekrarı"** kartı anasayfada: tüm alanlardan vadesi gelmiş
   kartlar tek destede toplanıyor.
5. **Günlük hedef** artık "öğrendim denilen kelime" değil "çalışılan kart"
   sayıyor; aynı kart günde bir kez sayılıyor (hedef şişirilemiyor).
6. **Veri taşıma:** eski `de_learned_v2` (düz id listesi) ve
   `kartlar_learned_v1` (`"Kategori::kelime"`) kayıtları açılışta 2. kutuya,
   bugün vadeli olarak taşınıyor. Eski ilerleme kaybolmuyor ama yeniden
   doğrulanıyor.

Test: Chrome'da uçtan uca denendi — taşıma, tekrar seansı, kutu geçişleri
(kolay → 7 gün, zor → 3 gün, hatırlamadım → bugün), quiz yazma modu, dürüstlük
kilidi, boş kuyruk hâli. Konsol hatasız.

---

## Dosya Yapısı

```
.
├── PROGRESS.md                 # BU DOSYA — proje hafızası
├── README.md                   # Kullanıcıya dönük tanıtım ve kurulum
├── index.html                  # Uygulama kabuğu (beş ekranın işaretlemesi)
├── package.json                # npm start / validate / sync betikleri
├── docs/VERI-REHBERI.md        # Veri şeması ve yeni parti entegrasyonu
├── tools/
│   ├── data-lib.mjs            # Araçların paylaştığı veri okuma yardımcıları
│   ├── validate-data.mjs       # Şema, id ve sayaç doğrulama (npm run validate)
│   └── sync-manifest.mjs       # fields.json'ı verilerden üretir (npm run sync)
└── src/
    ├── data/fields/            # fields.json (manifest) + 19 alan dosyası
    ├── styles/main.css         # Tüm stiller (açık/koyu tema, CSS değişkenleri)
    └── js/
        ├── main.js             # Giriş noktası, tüm olay bağlamaları
        ├── config.js           # Sabitler: SRS, GRADES, seviyeler, depolama anahtarları
        ├── dom.js              # DOM referansları (hepsi null olabilir)
        ├── state.js            # Ekranlar arası paylaşılan gezinme durumu
        ├── utils.js            # Karıştırma, seslendirme, gün/tarih, metin normalize
        ├── data/repository.js  # Manifest + alan dosyalarının yüklenmesi, kart arama
        ├── store/
        │   ├── storage.js      # localStorage sarmalayıcısı (hataya dayanıklı)
        │   ├── profile.js      # Tanışma testinin sonucu
        │   ├── interests.js    # Seçili alan id'leri
        │   ├── progress.js     # ★ SRS: kutu, vade, durum, taşıma, toplamlar
        │   └── stats.js        # Seri, XP, günlük hedef
        ├── ui/
        │   ├── header.js       # Üst bar (seri, XP)
        │   └── toast.js        # Kısa bildirimler
        └── screens/
            ├── navigation.js   # Ekran gösterme/gizleme
            ├── onboarding.js   # Tanışma testi + alan seçimi
            ├── home.js         # Anasayfa: tekrar kuyruğu, hedef, alan listesi
            ├── field.js        # Alan detayı: kategoriler
            ├── cards.js        # ★ Flashcard + değerlendirme akışı
            └── quiz.js         # Quiz: boşluk / anlam / yazma
```

---

## Teknik Kararlar ve Gerekçeleri

| Karar | Gerekçe |
|---|---|
| **Bağımlılık ve build yok** | Uygulama statik dosya olarak servis edilebiliyor; katkı için `npm install` gerekmiyor. ES modülleri yüzünden yerel sunucu şart. |
| **İlerleme anahtarı = kart id'si** | Kart metni düzeltilince ilerleme sıfırlanmasın diye. Id'nin alan öneki (`tip-042`) sayesinde bir alanın ilerlemesi, kart verisi indirilmeden yalnız kayıtlardan hesaplanabiliyor. |
| **Değerlendirme ön yüzde** | Cevabı gördükten sonra "biliyordum" demek tanımadır, hatırlama değil. Ölçüm ancak cevap gizliyken anlamlı. |
| **"Peek" → Kolay kapanır** | Kullanıcının kendini kandırması ölçümü bozar. Bakmak bir bilgi değil, bir sonuçtur. |
| **Çoktan seçmeliye kutu tavanı (`recognitionMaxBox: 3`)** | Dört şıkta %25 şansla doğru bulmak kalıcılık kanıtı değil. Kutu 4'ü (Kalıcı) yalnız yazma sorusu ya da kartta "Kolay" açar. |
| **Yazma modu 3 kelime / 20 karakter sınırı** | Uzun kalıpları yazdırmak dil sınavını imla sınavına çevirir. |
| **Seri (streak) kuyruğa değil çalışmaya bağlı** | Kuyruk 200 karta çıktığında seriyi kaybetmek kaçınılmaz olurdu; bu ceza kullanıcıyı uygulamadan soğutur. Kuyruk bunun yerine anasayfada en üstte duruyor. |
| **Günlük hedef kart başına bir kez sayar** | Aynı kartı tekrar tekrar işaretleyerek hedef şişirilemesin diye. |
| **İki katmanlı ilerleme çubuğu** | Dolu = kalıcı, soluk = çalışılıyor. Tek yüzde ilerlemeyi abartırdı. |
| **Savunmacı DOM erişimi** | `dom.js`'teki her referans null olabilir; eksik bir eleman tüm uygulamayı çökertmemeli. |
| **localStorage sarmalayıcısı sessizce yutar** | Gizli modda / kota dolduğunda uygulama çalışmaya devam etmeli. |

---

## TODO / Bilinen Eksikler

- [ ] **`SPEC.md` yok.** Ürün gereksinimleri README ve PROGRESS arasında
      dağınık. Tek bir spesifikasyon dosyası yazılmalı; bu dosyanın üstündeki
      referans o zaman gerçek bir bağlantıya dönüşür.
- [ ] **Otomatik test yok.** Özellikle `store/progress.js` (kutu geçişleri,
      vade hesabı, taşıma) ve `utils.js` (gün anahtarı, normalize) saf
      fonksiyonlar — birim testi yazmak kolay ve değerli olur.
- [ ] **Tekrar kuyruğuna üst sınır yok.** Uzun aradan sonra dönen kullanıcıyı
      500 kartlık kuyruk karşılayabilir. Günlük tekrar tavanı (örn. 50) ve
      kalanın ertelenmesi düşünülmeli.
- [ ] **Yeni kart tanıtım hızı sınırsız.** Kullanıcı bir oturumda 100 yeni kart
      açabilir, hepsi ertesi güne düşer. "Günde en fazla N yeni kart" ayarı.
- [ ] **İstatistik ekranı yok.** Kutu dağılımı, günlük tekrar grafiği, en çok
      unutulan kelimeler gösterilmiyor.
- [ ] **Veri dışa/içe aktarma yok.** Tüm ilerleme tek tarayıcının
      `localStorage`'ında; tarayıcı verisi silinirse her şey gider.
- [ ] **Yazma modunda yakın cevaba tolerans yok.** Tek harf hatası ("makup")
      tamamen yanlış sayılıyor; Levenshtein mesafesiyle "neredeyse doğru"
      geri bildirimi verilebilir.
- [ ] `GUNCELLEME.md` çalışma dizininde silinmiş görünüyordu (commit'lenmemiş
      silme). İçeriği PROGRESS.md'ye taşındığı için geri alınmadı — bilinçli
      bir karar olarak burada not edilir.

---

## Bilinen Buglar

- **Sıçrayan tıklama kartı çevirebilir.** Ekran geçişi sırasında (ör. "Tekrara
  başla" → kartlar ekranı) imlecin altında kalan karta tıklama düşerse kart
  "peek" sayılıp "Kolay" seçeneği kapanabilir. Otomasyon testinde gözlendi;
  gerçek kullanımda nadir ve kullanıcı yine de "Hatırlamadım/Zor" ile devam
  edebiliyor, bir sonraki tekrarda kendini düzeltiyor. Düşük öncelik.
- Bunun dışında bilinen açık bug yok (2026-07-22 itibarıyla).
