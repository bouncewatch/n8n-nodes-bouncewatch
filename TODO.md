# Doğrulama sonrasına bırakılanlar

n8n, incelemeye alınan sürümün demo videosunda gösterilenle **aynı** olmasını
istiyor. 0.1.3 manuel incelemede olduğu sürece yeni sürüm yayınlanmayacak.
Aşağıdakiler onay geldikten sonra, tek bir 0.1.4'te toplanacak.

## 1. Placeholder'lar değer gibi görünüyor  (2026-08-18, demo provasında yakalandı)

Koyu temada `NL` placeholder'ı doldurulmuş bir alan gibi okunuyor. Prova
sırasında filtre girilmiş sanıldı, sorgu filtresiz çalıştı ve Hollanda araması
Amerikan şirketi döndürdü. Kafa karışıklığı gerçek, kullanıcı da yaşar.

Düzeltme: isteğe bağlı filtre alanlarında `e.g.` öneki.

| Alan | Şimdi | Olacak |
|---|---|---|
| Country Code | `NL` | `e.g. NL` |
| Signal Keys | `recently_funded,key_hire_announced` | `e.g. recently_funded,key_hire_announced` |
| Categories | `funding,hiring` | `e.g. funding,hiring` |
| Funding Stage | `Series A` | `e.g. Series A` |

**Zorunlu alanlar da dahil.** Önce "orada risk yok, n8n kırmızı gösteriyor"
demiştim — yanlış. Aynı provada `Domain` alanı da placeholder yüzünden dolu
sanıldı; kırmızı çerçeve ve ⚠ ikonu çok ince sinyaller, placeholder metni
girilmiş değer gibi okunuyor. İki kez arka arkaya oldu.

| Alan | Şimdi | Olacak |
|---|---|---|
| Domain | `stripe.com` | `e.g. stripe.com` |
| Name | `Stripe` | `e.g. Stripe` |

## 2. Trigger manuel testte veri göstermiyor  (2026-08-18, demo provasında yakalandı)

`BounceWatchTrigger.poll()` ilk çalıştırmada `null` dönüyor — mevcut olanı
"görüldü" diye kaydedip tetiklemiyor. Üretimde **doğru**: geçmiş haber değildir.

Ama `Fetch Test Event`'e basan kullanıcı veri görmek ister, n8n'in geleneği de
o yönde. Şu an ilk basış boş, ikinci basış "Nothing new since the last check."
— "çalışmıyor" gibi okunuyor. Bu yüzden demo videosundan çıkarıldı.

Düzeltme: `this.getMode() === 'manual'` iken mevcut sinyalleri **döndür ama
seen'e yazma**. Böylece test verisi görünür, üretimdeki ilk-yoklama davranışı
bozulmaz.

## 3. Test yok

`package.json`'da `test` script'i yok. n8n'in gönderim ekranı "avoid automatic
rejection by running `npm run test`" diyor; otomatik inceleme geçti ama bir
sonraki sürümde en azından transport için birkaç test iyi olur.
