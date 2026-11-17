# VAKTİM – Android Ezan ve Namaz Vakitleri MVP

Bu proje Expo + React Native ile hazırlanmış Android başlangıç sürümüdür.

## Özellikler
- Türkiye şehirleri için namaz vakitlerini `adhan` kütüphanesi ve Türkiye hesaplama yöntemiyle hesaplama
- Sonraki vakte geri sayım
- Şehir seçimi veya cihaz konumunu kullanma
- Bugünün kalan vakitleri için yerel bildirim kurma
- Kıble açısını hesaplama
- Kısa dua/tesbih ekranı

## Çalıştırma
1. Node.js LTS ve Android Studio/Expo Go kur.
2. `mobile` klasörüne gir.
3. `npm install`
4. `npx expo start`
5. Android telefonda Expo Go ile QR kodu okut.

## Önemli notlar
- Bu bir MVP/kaynak projedir; APK olarak derlenmiş değildir.
- Şehir listesi başlangıç için seçilmiş 10 şehri içerir. İstenirse tüm Türkiye il/ilçe listesi eklenebilir.
- Bildirimler uygulama içinde o günün kalan vakitlerine kurulur; yeni gün için uygulamayı açıp bildirimleri yenilemek gerekir. Üretim sürümünde günlük otomatik yenileme ve Android yeniden başlatma sonrası planlama eklenmelidir.
- Kıble açısı matematiksel olarak hesaplanır; gerçek pusula yönü için cihaz manyetometresi/kalibrasyonu henüz bağlanmadı.
- Namaz vakitleri resmi Diyanet verisiyle birebir eşleşme garantisi taşımaz. Yayın öncesi Diyanet'in resmi vakitleriyle il/ilçe bazında doğrulama yapılmalı; gerekiyorsa resmi veri kaynağı entegrasyonu eklenmelidir.
- Bildirim izinleri Android sürümüne göre değişebilir.
- Play Store yayını için uygulama imzası, gizlilik politikası, izin açıklamaları ve test gerekir.
