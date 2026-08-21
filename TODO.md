# 0.1.4'e girecekler

n8n doğrulaması **2026-08-21'de onaylandı**, sürüm kilidi kalktı. n8n artık yeni
npm sürümlerini kendisi alıyor (iki haftalık döngü) ama **GitHub'daki değişikliğin
şeffaf olmasını** şart koşuyor — release notu ve okunur commit geçmişi gerekiyor.

## ✅ Yapıldı (2026-08-21)

**1. Trigger yanlış anahtarı okuyordu — CANLI HATA.**
`check_watches` `data.events` döndürüyor; trigger `data.companies` okuyordu.
Yani **tetikleyici hiç ateşlenmiyordu**. Üstüne, `include_acknowledged`
gönderilmediği için sunucu her yoklamada olayları "toplandı" diye işaretliyor
ve trigger onları yanlış anahtardan okuyamayıp atıyordu — kuyruk sessizce
boşalıyordu. Aynı hatayı 2026-08-20'de Zapier app'inde bulup düzeltmiştik.
Artık `events` okunuyor, `include_acknowledged: true` gönderiliyor ve tekilleme
sunucunun verdiği `event_id` üzerinden yapılıyor.

**2. `Watch → Check` operasyonu da aynı hatadaydı.** `splitKey: 'companies'` →
`'events'`.

**3. `Minimum Weight` alanı kaldırıldı.** 1-10 ağırlık kasıtlı olarak dışarı
verilmiyor (`SignalSerializer` `tier` gönderiyor), yani o filtre hiçbir zaman
hiçbir şeyi elemiyordu. Eşik zaten watch'ın üstünde duruyor.

**4. Placeholder'lara `e.g.` öneki.** Altı alan. Gri metin doldurulmuş değer gibi
okunuyordu; 2026-08-20'de Zapier'de üç kez bu yüzden yanlış sorgu çalıştı.

**5. Trigger manuel testte veri gösteriyor.** `Fetch Test Event` artık izleme
listesinde ne varsa onu döndürüyor ve hiçbir şeyi "görüldü" diye yazmıyor —
workflow'u sonradan açtığında geçmiş yine haber sayılmıyor.

## Kalan

**6. Test script'i yok.** `package.json`'da `test` yok. En azından transport ve
tetikleyicinin şekil okuması için birkaç test.

**7. `CHANGELOG.md` yok.** n8n sürüm incelemesi için şart sayılmasa da
"changes are transparent" beklentisinin en kolay karşılanma yolu.

## Şablonlar

`templates/` altında 20 workflow template'i ve `DESCRIPTIONS.md`. Gönderim
kuralları ve SEO hedefleri:
`bouncewatch/distribution-kit/submissions/08-n8n-templates.md`
