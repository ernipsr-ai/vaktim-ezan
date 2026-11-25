import { ActivityIndicator as SplashSpinner } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as VaktimBackground } from 'react-native';
import { Linking } from 'react-native';
import { Modal, TextInput } from 'react-native';
import { BackHandler } from 'react-native';
import { NativeModules } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { ayetSesAdresi } from './ayet-sesleri';
import kuranTurkce from './kuran-turkce.json';
const turkceSureAdi = (sure) => ({"1": "Fâtiha", "2": "Bakara", "3": "Âl-i İmrân", "4": "Nisâ", "5": "Mâide", "6": "En'âm", "7": "A'râf", "8": "Enfâl", "9": "Tevbe", "10": "Yûnus", "11": "Hûd", "12": "Yûsuf", "13": "Ra'd", "14": "İbrâhîm", "15": "Hicr", "16": "Nahl", "17": "İsrâ", "18": "Kehf", "19": "Meryem", "20": "Tâhâ", "21": "Enbiyâ", "22": "Hac", "23": "Mü'minûn", "24": "Nûr", "25": "Furkân", "26": "Şuarâ", "27": "Neml", "28": "Kasas", "29": "Ankebût", "30": "Rûm", "31": "Lokmân", "32": "Secde", "33": "Ahzâb", "34": "Sebe'", "35": "Fâtır", "36": "Yâsîn", "37": "Sâffât", "38": "Sâd", "39": "Zümer", "40": "Mü'min", "41": "Fussilet", "42": "Şûrâ", "43": "Zuhruf", "44": "Duhân", "45": "Câsiye", "46": "Ahkâf", "47": "Muhammed", "48": "Fetih", "49": "Hucurât", "50": "Kâf", "51": "Zâriyât", "52": "Tûr", "53": "Necm", "54": "Kamer", "55": "Rahmân", "56": "Vâkıa", "57": "Hadîd", "58": "Mücâdele", "59": "Haşr", "60": "Mümtehine", "61": "Saf", "62": "Cum'a", "63": "Münâfikûn", "64": "Tegâbün", "65": "Talâk", "66": "Tahrîm", "67": "Mülk", "68": "Kalem", "69": "Hâkka", "70": "Meâric", "71": "Nûh", "72": "Cin", "73": "Müzzemmil", "74": "Müddessir", "75": "Kıyâmet", "76": "İnsân", "77": "Mürselât", "78": "Nebe'", "79": "Nâziât", "80": "Abese", "81": "Tekvîr", "82": "İnfitâr", "83": "Mutaffifîn", "84": "İnşikâk", "85": "Bürûc", "86": "Târık", "87": "A'lâ", "88": "Gâşiye", "89": "Fecr", "90": "Beled", "91": "Şems", "92": "Leyl", "93": "Duhâ", "94": "İnşirâh", "95": "Tîn", "96": "Alak", "97": "Kadir", "98": "Beyyine", "99": "Zilzâl", "100": "Âdiyât", "101": "Kâria", "102": "Tekâsür", "103": "Asr", "104": "Hümeze", "105": "Fîl", "106": "Kureyş", "107": "Mâûn", "108": "Kevser", "109": "Kâfirûn", "110": "Nasr", "111": "Tebbet", "112": "İhlâs", "113": "Felak", "114": "Nâs"}[sure.number] || sure.englishName);
import AsyncStorage from '@react-native-async-storage/async-storage';
import kuranArapca from './kuran-arapca.json';
import sureler from './sureler.json';
import { Magnetometer } from "expo-sensors";
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform} from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
let vaktimBildirimKilit = false;
import {Coordinates, CalculationMethod, PrayerTimes, Qibla} from 'adhan';
import {StatusBar} from 'expo-status-bar';

const CITIES = {
  'Adana': [37.0000, 35.3213],
  'Adıyaman': [37.7648, 38.2786],
  'Afyonkarahisar': [38.7507, 30.5567],
  'Ağrı': [39.7191, 43.0503],
  'Aksaray': [38.3687, 34.0370],
  'Amasya': [40.6499, 35.8353],
  'Ankara': [39.9334, 32.8597],
  'Antalya': [36.8969, 30.7133],
  'Ardahan': [41.1105, 42.7022],
  'Artvin': [41.1828, 41.8183],
  'Aydın': [37.8560, 27.8416],
  'Balıkesir': [39.6484, 27.8826],
  'Bartın': [41.6344, 32.3375],
  'Batman': [37.8812, 41.1351],
  'Bayburt': [40.2552, 40.2249],
  'Bilecik': [40.0567, 30.0665],
  'Bingöl': [38.8854, 40.4983],
  'Bitlis': [38.4006, 42.1095],
  'Bolu': [40.7395, 31.6116],
  'Burdur': [37.7203, 30.2908],
  'Bursa': [40.1885, 29.0610],
  'Çanakkale': [40.1553, 26.4142],
  'Çankırı': [40.6013, 33.6134],
  'Çorum': [40.5506, 34.9556],
  'Denizli': [37.7765, 29.0864],
  'Diyarbakır': [37.9144, 40.2306],
  'Düzce': [40.8438, 31.1565],
  'Edirne': [41.6771, 26.5557],
  'Elazığ': [38.6810, 39.2264],
  'Erzincan': [39.7500, 39.5000],
  'Erzurum': [39.9043, 41.2679],
  'Eskişehir': [39.7667, 30.5256],
  'Gaziantep': [37.0662, 37.3833],
  'Giresun': [40.9128, 38.3895],
  'Gümüşhane': [40.4603, 39.4814],
  'Hakkari': [37.5744, 43.7408],
  'Hatay': [36.2021, 36.1606],
  'Iğdır': [39.9237, 44.0450],
  'Isparta': [37.7648, 30.5566],
  'İstanbul': [41.0082, 28.9784],
  'İzmir': [38.4237, 27.1428],
  'Kahramanmaraş': [37.5858, 36.9371],
  'Karabük': [41.2061, 32.6204],
  'Karaman': [37.1759, 33.2287],
  'Kars': [40.6013, 43.0975],
  'Kastamonu': [41.3887, 33.7827],
  'Kayseri': [38.7225, 35.4875],
  'Kırıkkale': [39.8468, 33.5153],
  'Kırklareli': [41.7351, 27.2252],
  'Kırşehir': [39.1458, 34.1639],
  'Kilis': [36.7184, 37.1212],
  'Kocaeli': [40.7654, 29.9408],
  'Konya': [37.8746, 32.4932],
  'Kütahya': [39.4167, 29.9833],
  'Malatya': [38.3552, 38.3095],
  'Manisa': [38.6191, 27.4289],
  'Mardin': [37.3212, 40.7245],
  'Mersin': [36.8121, 34.6415],
  'Muğla': [37.2153, 28.3636],
  'Muş': [38.9462, 41.7539],
  'Nevşehir': [38.6244, 34.7239],
  'Niğde': [37.9667, 34.6833],
  'Ordu': [40.9839, 37.8764],
  'Osmaniye': [37.0742, 36.2478],
  'Rize': [41.0201, 40.5234],
  'Sakarya': [40.7569, 30.3781],
  'Samsun': [41.2867, 36.3300],
  'Siirt': [37.9333, 41.9500],
  'Sinop': [42.0231, 35.1531],
  'Sivas': [39.7477, 37.0179],
  'Şanlıurfa': [37.1674, 38.7955],
  'Şırnak': [37.4187, 42.4918],
  'Tekirdağ': [40.9780, 27.5110],
  'Tokat': [40.3167, 36.5500],
  'Trabzon': [41.0027, 39.7168],
  'Tunceli': [39.1079, 39.5401],
  'Uşak': [38.6823, 29.4082],
  'Van': [38.4891, 43.4089],
  'Yalova': [40.6550, 29.2769],
  'Yozgat': [39.8181, 34.8147],
  'Zonguldak': [41.4564, 31.7987],
};
const NAMES = [['fajr','İmsak'],['sunrise','Güneş'],['dhuhr','Öğle'],['asr','İkindi'],['maghrib','Akşam'],['isha','Yatsı']];
const fmt = d => d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
const dateText = d => d.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

export default function App() {
  const [city,setCity] = useState('İstanbul');
  const [coords,setCoords] = useState(CITIES['İstanbul']);
  const [locLabel,setLocLabel] = useState('Şehir seçimi');
  const [tab,setTab] = useState('Vakitler');
  const [selectedSure,setSelectedSure] = useState(null);
  const manuelSehir = useRef(false);

  useEffect(() => {
    const ayarlariAc = (url) => {
      if (url === 'vaktim://ayarlar') {
        setSelectedSure(null);
        setTab('Ayarlar');
      }
    };

    Linking.getInitialURL().then(ayarlariAc).catch(console.warn);

    const abonelik = Linking.addEventListener('url', ({url}) => {
      ayarlariAc(url);
    });

    return () => abonelik.remove();
  }, []);

  const [sehirAcik,setSehirAcik] = useState(false);
  const [sehirAra,setSehirAra] = useState('');


  useEffect(() => {
    let aktif = true;

    async function konumuOtomatikBul() {
      try {
        const kayit = await AsyncStorage.getItem('vaktim_sehir');
        if (!aktif || manuelSehir.current) return;
        if (kayit && CITIES[kayit]) {
          manuelSehir.current = true;
          setCity(kayit);
          setCoords(CITIES[kayit]);
          setLocLabel('Şehir seçimi');
          return;
        }
        const izin = await Location.getForegroundPermissionsAsync();
        if (izin.status !== 'granted') return;

        const yer = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        if (!aktif || manuelSehir.current) return;

        setCoords([yer.coords.latitude, yer.coords.longitude]);
        setLocLabel('Mevcut konum');

        const adres = await Location.reverseGeocodeAsync({
          latitude: yer.coords.latitude,
          longitude: yer.coords.longitude
        });
        if (aktif && !manuelSehir.current && adres[0]?.city) {
          setCity(adres[0].city);
        }
      } catch (hata) {
        console.warn('Otomatik konum:', hata);
      }
    }

    konumuOtomatikBul();
    return () => { aktif = false; };
  }, []);



  useEffect(() => {
    const abonelik = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedSure !== null) {
        setSelectedSure(null);
        return true;
      }
      if (tab !== 'Vakitler') {
        setTab('Vakitler');
        return true;
      }
      return false;
    });
    return () => abonelik.remove();
  }, [tab, selectedSure]);


  const audioPlayer = useAudioPlayer(null);
  const audioStatus = useAudioPlayerStatus(audioPlayer);
  const [calinanSure, setCalinanSure] = useState(null);
  const [aktifAyet, setAktifAyet] = useState(null);
  const [ayetTakipAcik, setAyetTakipAcik] = useState(false);
  const kuranScrollRef = useRef(null);
  const ayetKonumlari = useRef({});

  const ayetDinle = (sureNo, ayetNo) => {
    const adres = ayetSesAdresi(sureNo, ayetNo);
    setAktifAyet(ayetNo);
    setCalinanSure(sureNo);
    audioPlayer.replace({ uri: adres });
    audioPlayer.play();
  };



  const sureDinle = (sure) => {
    const numara = sureler.find(x => x.englishName === sure)?.number;
    if (!numara) return;

    const adres = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${numara}.mp3`;
    audioPlayer.pause();
    setCalinanSure(numara);
    audioPlayer.replace({ uri: adres });
    audioPlayer.play();
  };


  useEffect(() => {
    if (!ayetTakipAcik || !audioStatus.didJustFinish) return;

    const sureNo = calinanSure;
    const toplamAyet = sureler.find(
      s => s.number === sureNo
    )?.numberOfAyahs;

    if (!toplamAyet || !aktifAyet) return;

    if (aktifAyet < toplamAyet) {
      ayetDinle(sureNo, aktifAyet + 1);
    } else {
      setAyetTakipAcik(false);
      setAktifAyet(null);
    }
  }, [audioStatus.didJustFinish]);


  useEffect(() => {
    if (!ayetTakipAcik || !aktifAyet) return;

    const konum = ayetKonumlari.current[aktifAyet];

    if (konum !== undefined) {
      kuranScrollRef.current?.scrollTo({
        y: Math.max(0, konum + 250),
        animated: true
      });
    }
  }, [aktifAyet, ayetTakipAcik]);

  const [arapcaBoyut, setArapcaBoyut] = useState(27);
  const [tesbihCount,setTesbihCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('vaktim_tesbih')
      .then(value => {
        if (value !== null) setTesbihCount(Number(value));
      })
      .catch(console.warn);
  }, []);

  const saveTesbihCount = (value) => {
    setTesbihCount(value);
    AsyncStorage.setItem('vaktim_tesbih', String(value))
      .catch(console.warn);
  };

  const [now,setNow] = useState(new Date());
  const [notifications,setNotifications] = useState(false);
  const [heading,setHeading] = useState(null);

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t); },[]);
  useEffect(()=>{ (async()=>{ try {
    const p=await Notifications.getPermissionsAsync();
    setNotifications(p.granted);
  } catch(e){} })(); },[]);

  const prayerData = useMemo(()=>{
    const c = new Coordinates(coords[0],coords[1]);
    const params = CalculationMethod.Turkey();
    const pt = new PrayerTimes(c,now,params);
    const items = NAMES.map(([key,label])=>({key,label,time:pt[key]}));
    const upcoming = items.find(x=>x.time>now) || null;
    return {items,upcoming,pt};
  },[coords,now.toDateString()]);

  const nextPrayer = useMemo(()=>{
    const {items}=prayerData;
    const next=items.find(x=>x.time>now);
    if(next) return next;
    const tomorrow=new Date(now); tomorrow.setDate(tomorrow.getDate()+1);
    const pt=new PrayerTimes(new Coordinates(coords[0],coords[1]),tomorrow,CalculationMethod.Turkey());
    return {label:'İmsak',time:pt.fajr};
  },[prayerData,now,coords]);


  useEffect(() => {
    if (!nextPrayer || !NativeModules.WidgetData) return;
    const vakit = nextPrayer.label || 'Namaz';
    const saat = nextPrayer.time
      ? fmt(nextPrayer.time)
      : '--:--';

    const takvim = [];
    for (let i = 0; i < 30; i++) {
      const gun = new Date(now);
      gun.setDate(gun.getDate() + i);
      const pt = new PrayerTimes(
        new Coordinates(coords[0], coords[1]),
        gun,
        CalculationMethod.Turkey()
      );
      NAMES.forEach(([key,label]) => {
        takvim.push({
          label,
          time: pt[key].getTime()
        });
      });
    }

    NativeModules.WidgetData.updateWidget(
      city || 'İstanbul',
      vakit,
      saat,
      JSON.stringify(takvim)
    );
  }, [city, coords, now.toDateString(), nextPrayer?.time?.getTime()]);

  const countdown = useMemo(()=>{
    let s=Math.max(0,Math.floor((nextPrayer.time-now)/1000));
    const h=String(Math.floor(s/3600)).padStart(2,'0'); s%=3600;
    const m=String(Math.floor(s/60)).padStart(2,'0'); const sec=String(s%60).padStart(2,'0');
    return `${h}:${m}:${sec}`;
  },[nextPrayer,now]);

  async function useLocation(){
    try {
      const {status}=await Location.requestForegroundPermissionsAsync();
      if(status!=='granted'){Alert.alert('Konum izni gerekli','Konum izni vermezsen şehir listesinden seçim yapabilirsin.');return;}
      const l=await Location.getCurrentPositionAsync({});
      await AsyncStorage.removeItem('vaktim_sehir');
      manuelSehir.current=false;
      setCoords([l.coords.latitude,l.coords.longitude]); setLocLabel('Mevcut konum');
      const rev=await Location.reverseGeocodeAsync({latitude:l.coords.latitude,longitude:l.coords.longitude});
      if(rev[0]?.city) setCity(rev[0].city);
    } catch(e){Alert.alert('Konum alınamadı','Lütfen şehir listesinden seçim yap.');}
  }

  async function chooseCity(){
    setSehirAra('');
    setSehirAcik(true);
  }


  
  async function vaktimBildirimTesti(){
    try {
      const izin = await Notifications.requestPermissionsAsync();
      if (!izin.granted) {
        Alert.alert('Bildirim izni gerekli');
        return;
      }
      const zaman = new Date(Date.now() + 60000);
      await Notifications.scheduleNotificationAsync({
        identifier: 'vaktim-test-bildirimi',
        content: {
          title: 'VAKTİM Bildirim Testi',
          body: 'Beklenen saat: ' + zaman.toLocaleTimeString('tr-TR'),
          sound: true
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: zaman
        }
      });
      Alert.alert('Test hazır', 'Ekranı kapat. Beklenen saat: ' + zaman.toLocaleTimeString('tr-TR'));
    } catch(e) {
      Alert.alert('Test hatası', String(e));
    }
  }

async function toggleNotifications(){
    if (vaktimBildirimKilit) return;
    vaktimBildirimKilit = true;
    try {
      const {status} = await Notifications.requestPermissionsAsync();
      if(status !== 'granted') {
        Alert.alert('Bildirim izni gerekli', 'Lütfen bildirim izni verin.');
        return;
      }
      const coordinates = new Coordinates(coords[0], coords[1]);
      const params = CalculationMethod.Turkey();
      const prayerNames = NAMES.filter(([key]) => key !== 'sunrise');
      const now = new Date();
      let count = 0;
      await Notifications.cancelAllScheduledNotificationsAsync();
      for(let day = 0; day < 30; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day);
        const times = new PrayerTimes(coordinates, date, params);
        for(const [key, label] of prayerNames) {
          const prayerTime = times[key];
          if(prayerTime > now) {
            await Notifications.scheduleNotificationAsync({
          identifier: `vaktim-${key}-${prayerTime.getTime()}`,
              content: {
                title: `${label} vakti`,
                body: `${city} için ${label} namazı vakti girdi.`,
                sound: true
              },
              trigger: {type: Notifications.SchedulableTriggerInputTypes.DATE, date: prayerTime}
            });
            count++;
          }
        }
      }
      setNotifications(true);
      Alert.alert('Bildirimler hazır', `${count} namaz vakti bildirimi planlandı.`);
    } catch(e) {
      Alert.alert('Hata', String(e));
    } finally {
      vaktimBildirimKilit = false;
    }
  }

  useEffect(() => {
    if (tab !== 'Kıble') return;
    Magnetometer.setUpdateInterval(200);
    const subscription = Magnetometer.addListener(({ x, y }) => {
      const angle = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      setHeading(angle);
    });
    return () => subscription.remove();
  }, [tab]);
  const qibla = Qibla(new Coordinates(coords[0],coords[1]));
  
const [vaktimAcilisHazir,setVaktimAcilisHazir] = useState(false);

const hizliSureListesi = useMemo(() => {
  if ((tab !== "Kur'an" && tab !== "Kur’an") || selectedSure !== null) return null;
  return sureler.map((sure,i)=>
              <Pressable key={i} onPress={()=>setSelectedSure(sure.englishName)}
                style={{paddingVertical:14,borderBottomWidth:1,borderBottomColor:'#29354D'}}>
                
<View style={{flexDirection:'row',alignItems:'center',paddingVertical:8}}>
  <View style={{width:38,height:38,borderRadius:12,backgroundColor:'#E7C77B22',alignItems:'center',justifyContent:'center'}}>
    <Text style={{color:'#E7C77B',fontWeight:'bold'}}>{sure.number}</Text>
  </View>
  <View style={{flex:1,marginLeft:12}}>
    <Text style={{color:'#FFFFFF',fontSize:17,fontWeight:'bold'}}>{turkceSureAdi(sure)}</Text>
    <Text style={{color:'#AAB9CF',fontSize:12,marginTop:4}}>{sure.numberOfAyahs} ayet</Text>
  </View>
  <Ionicons name="chevron-forward" size={20} color="#E7C77B"/>
</View>

              </Pressable>
            );
}, [tab, selectedSure, sureler]);

const tabs=['Vakitler','Kıble','Dualar','Tesbih','Takvim','Kur’an','Ayarlar'];
  return <SafeAreaView style={s.safe}>
    <VaktimBackground
      source={require('./assets/vaktim-arka-plan.jpg')}
onLoadEnd={()=>setVaktimAcilisHazir(true)}

      resizeMode="cover"
      pointerEvents="none"
      style={{
        position:'absolute',
        top:0,
        left:0,
        width:'100%',
        height:'100%',
        opacity:0.85
      }}
    />
<StatusBar style="light"/>
    
<Modal visible={sehirAcik} animationType="slide" onRequestClose={()=>setSehirAcik(false)}>
<SafeAreaView style={{flex:1,backgroundColor:'#090F20',padding:20}}>
<Text style={{color:'#E7C77B',fontSize:26,fontWeight:'bold',marginTop:30}}>Şehir seç</Text>
<TextInput value={sehirAra} onChangeText={setSehirAra} placeholder="Şehir ara..." placeholderTextColor="#8994AA" style={{color:'#FFFFFF',backgroundColor:'#18233B',padding:15,borderRadius:12,marginVertical:15}}/>
<ScrollView keyboardShouldPersistTaps="handled">
{Object.keys(CITIES).filter(n=>n.toLocaleLowerCase('tr-TR').includes(sehirAra.toLocaleLowerCase('tr-TR'))).map(n=>
<Pressable key={n} onPress={()=>{manuelSehir.current=true;AsyncStorage.setItem('vaktim_sehir',n).catch(console.warn);setCity(n);setCoords(CITIES[n]);setLocLabel('Şehir seçimi');setSehirAcik(false);}} style={{padding:16,borderBottomWidth:1,borderColor:'#34425D'}}>
<Text style={{color:'#FFFFFF',fontSize:18}}>{n}</Text>
</Pressable>)}
</ScrollView>
<Pressable onPress={()=>setSehirAcik(false)} style={{padding:18}}>
<Text style={{color:'#E7C77B',textAlign:'center',fontSize:18}}>Kapat</Text>
</Pressable>
</SafeAreaView>
</Modal>
<ScrollView ref={kuranScrollRef} contentContainerStyle={s.page}>
      <View style={s.header}><View><Text style={s.brand}>VAKTİM</Text><Text style={s.sub}>Vaktin huzur olsun</Text></View><Pressable style={s.cityBtn} onPress={chooseCity}><Text style={s.cityText}>⌖  {city} ▾</Text></Pressable></View>
      <View style={s.dateBox}><Text style={s.date}>{dateText(now)}</Text><Text style={s.hijri}>Namaz vakitleri · Türkiye hesaplama yöntemi</Text></View>
      <View style={s.hero}>
        <Text style={s.eyebrow}>SIRADAKİ VAKİT</Text><Text style={s.next}>{nextPrayer.label}</Text>
        <Text style={s.nextTime}>{fmt(nextPrayer.time)}</Text><Text style={s.countLabel}>Kalan süre</Text><Text style={s.count}>{countdown}</Text>
        <View style={s.moon}><Text style={s.moonText}>☾</Text></View>
      </View>

      {tab==='Vakitler'&&<View style={s.card}>
        <Text style={s.section}>BUGÜNÜN VAKİTLERİ</Text>
        {prayerData.items.map((p,i)=><View key={p.key} style={[s.prayerRow,i===0&&{borderTopWidth:0}]}><View style={s.prayerLeft}><Text style={s.prayerIcon}>{['☀','◉','☼','◒','☾','✦'][i]}</Text><Text style={s.prayerName}>{p.label}</Text></View><Text style={[s.prayerTime,p.key===nextPrayer.label?.toLowerCase()&&s.gold]}>{fmt(p.time)}</Text></View>)}
        <Text style={s.note}>Vakitler seçilen konuma ve Türkiye hesaplama yöntemine göre hesaplanır.</Text>
      </View>}
      {tab==='Kıble'&&<View style={s.card}><Text style={s.section}>KIBLE YÖNÜ</Text><View style={s.compass}><Text style={s.compassN}>K</Text><Text style={[s.needle,{transform:[{rotate:`${(qibla-(heading??0)+315+360)%360}deg`}]}]}>➤</Text><Text style={s.kaaba}>▣</Text></View><Text style={s.qiblaText}>Kıble açısı: {Math.round(qibla)}°</Text><Text style={s.note}>Bu sürümde kıble açısı kuzeye göre gösterilir. Pusula yönünü doğru kullanmak için telefonun sensör kalibrasyonu gerekir.</Text></View>}
      {tab==='Kur’an'&&<View style={s.card}>
          <Text style={s.section}>KUR'AN-I KERİM</Text>
          {selectedSure!==null&&<Pressable onPress={()=>setSelectedSure(null)}>
            <Text style={{color:'#E7C77B',marginVertical:15}}>← Sure listesine dön</Text>
          </Pressable>}
          {selectedSure===null?
            hizliSureListesi:
            <View>
              <Text style={{color:'#E7C77B',fontSize:25,textAlign:'center',marginVertical:25}}>
                {turkceSureAdi(sureler.find(x=>x.englishName===selectedSure)||{englishName:selectedSure})} Suresi
              </Text>
              
        <Pressable
          onPress={() => {
            const numara = sureler.find(x => x.englishName === selectedSure)?.number;
                if (calinanSure !== numara) {
                  sureDinle(selectedSure);
                } else if (audioStatus.playing) {
                  audioPlayer.pause();
                } else if (audioStatus.currentTime > 0) {
                  audioPlayer.play();
                } else {
                  sureDinle(selectedSure);
                }
          }}
          style={{
            backgroundColor:'#E7C77B',
            padding:16,
            borderRadius:14,
            marginVertical:18,
            alignItems:'center'
          }}>
          <Text style={{color:'#101A30',fontSize:18,fontWeight:'bold'}}>
            {calinanSure === sureler.find(x => x.englishName === selectedSure)?.number && audioStatus.playing ? '⏸ Duraklat' :
              audioStatus.currentTime > 0 ? '▶ Devam Et' :
              '▶ Sureyi Dinle'}
          </Text>
        </Pressable>

        
              <Pressable
                onPress={() => {
                  const no = sureler.find(
                    x => x.englishName === selectedSure
                  )?.number;
                  if (!no) return;

                  if (ayetTakipAcik) {
                    audioPlayer.pause();
                    setAyetTakipAcik(false);
                    setAktifAyet(null);
                  } else {
                    setAyetTakipAcik(true);
                    ayetDinle(no, 1);
                  }
                }}
                style={{
                  backgroundColor: '#315C47',
                  padding: 16,
                  borderRadius: 14,
                  marginVertical: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 17,
                  fontWeight: 'bold'
                }}>
                  {ayetTakipAcik
                    ? '⏹ Ayet Takibini Durdur'
                    : '🎧 Ayet Takibini Başlat'}
                </Text>
              </Pressable>


<View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:20,marginVertical:18}}>
  <Pressable onPress={() => setArapcaBoyut(b => Math.max(20,b-2))}
    style={{backgroundColor:'#E7C77B',padding:12,borderRadius:12}}>
    <Text style={{fontSize:20,color:'#102038',fontWeight:'bold'}}>A−</Text>
  </Pressable>
  <Text style={{color:'#E7C77B',fontSize:16}}>Arapça Yazı</Text>
  <Pressable onPress={() => setArapcaBoyut(b => Math.min(42,b+2))}
    style={{backgroundColor:'#E7C77B',padding:12,borderRadius:12}}>
    <Text style={{fontSize:20,color:'#102038',fontWeight:'bold'}}>A+</Text>
  </Pressable>
</View>
{(kuranArapca[String(
                sureler.find(x=>x.englishName===selectedSure)?.number
              )] || []).map(ayet=>
                <View
                    key={ayet.number}
                    onLayout={(event) => {
                      ayetKonumlari.current[ayet.number] =
                        event.nativeEvent.layout.y;
                    }}
                    style={{
                      backgroundColor:
                        ayetTakipAcik && aktifAyet === ayet.number
                          ? '#315C47'
                          : 'transparent',
                  paddingVertical:18,
                  borderBottomWidth:1,
                  borderBottomColor:'#29354D'
                }}>
                  <Text style={{
                    color:'#E7C77B',
                    fontSize:14,
                    marginBottom:12
                  }}>Ayet {ayet.number}
                      {ayetTakipAcik && aktifAyet === ayet.number ? ' ☝️ Okunuyor' : ''}
                    </Text>
                  <Text style={{
                    color:'#FFFFFF',
                    fontSize: arapcaBoyut,
lineHeight: arapcaBoyut * 1.9,
                    textAlign:'right',
                    writingDirection:'rtl',
                  paddingHorizontal:16
                  }}>{ayet.text}</Text>
<Text style={{
  color:'#E7C77B',
  fontSize:16,
  lineHeight:27,
  marginTop:12,
  textAlign:'left'
}}>
  {kuranTurkce[String(sureler.find(x=>x.englishName===selectedSure)?.number)]?.find(m=>m.number===ayet.number)?.text || ''}
</Text>
                </View>
              )}
            </View>
          }
        </View>}
        {tab==='Takvim'&&<View style={s.card}>
      <Text style={s.section}>HİCRİ TAKVİM</Text>
      <Text style={{color:'#E7C77B',fontSize:25,textAlign:'center',marginTop:25}}>
        {new Intl.DateTimeFormat('tr-TR-u-ca-islamic', {
          day:'numeric',month:'long',year:'numeric'
        }).format(now)}
      </Text>
      <Text style={{color:'#FFFFFF',fontSize:17,textAlign:'center',marginTop:18}}>
        {dateText(now)}
      </Text>
      <Text style={s.note}>
        Hicri tarihler kullanılan takvim yöntemine ve bölgesel gözleme göre
        bir gün farklılık gösterebilir.
      </Text>
    </View>}
    {tab==='Tesbih'&&<View style={s.card}>
      <Text style={s.section}>DİJİTAL TESBİH</Text>
      
<View style={{alignSelf:'center',width:180,height:180,borderRadius:90,borderWidth:3,borderColor:'#E7C77B',backgroundColor:'#142640DD',alignItems:'center',justifyContent:'center',marginVertical:24}}>
  <Text style={{color:'#E7C77B',fontSize:56,fontWeight:'bold'}}>{tesbihCount}</Text>
  <Text style={{color:'#AAB9CF',fontSize:14}}>Zikir sayisi</Text>
</View>

      <Pressable onPress={()=>saveTesbihCount(tesbihCount+1)}
        style={{backgroundColor:'#E7C77B',padding:20,borderRadius:18,alignItems:'center',marginBottom:15}}>
        <Text style={{color:'#090F20',fontSize:20,fontWeight:'bold'}}>ZİKİR SAY</Text>
      </Pressable>
      <Pressable onPress={()=>saveTesbihCount(0)}>
        <Text style={{color:'#FFFFFF',textAlign:'center',padding:12}}>Sıfırla</Text>
      </Pressable>
    </View>}
    {tab==='Dualar'&&<View style={s.card}><Text style={s.section}>GÜNLÜK DUA VE ZİKİRLER</Text>{[['Sabah zikri','سُبْحَانَ اللَّهِ وَبِحَمْدِهِ','Allah’ı hamdiyle tesbih ederim.'],['Tesbih','سُبْحَانَ اللَّهِ','Allah’ı her türlü noksanlıktan tenzih ederim.'],['Hamd','الْحَمْدُ لِلَّهِ','Hamd Allah’a mahsustur.'],['Tekbir','اللَّهُ أَكْبَرُ','Allah en büyüktür.']].map((d,i)=><View key={i} style={s.dua}><Text style={s.duaTitle}>{d[0]}</Text><Text style={s.arabic}>{d[1]}</Text><Text style={s.note}>{d[2]}</Text></View>)}</View>}
      
{tab==='Ayarlar' && <View style={s.card}>
<Text style={s.section}>KONUM AYARLARI</Text>
<Text style={{color:'#FFFFFF',fontSize:18,marginVertical:15}}>Seçili şehir: {city}</Text>
<Pressable style={s.locationBtn} onPress={chooseCity}>
<Text style={s.locationText}>81 İl - Manuel şehir seç</Text>
</Pressable>
</View>}
<Pressable style={s.locationBtn} onPress={useLocation}><Text style={s.locationText}>◎  Mevcut konumumu kullan</Text></Pressable>
      <Pressable style={[s.notifyBtn,notifications&&s.notifyOn]} onPress={toggleNotifications} onLongPress={vaktimBildirimTesti}><Text style={s.notifyText}>{notifications?'✓  Bildirim izni açık · Vakitleri yenile':'♢  Ezan vakti bildirimlerini aç'}</Text></Pressable>
      
{tab==='Menü' && <View style={s.card}>
  <Text style={s.section}>TÜM HİZMETLER</Text>
  {[
    [tabs[2],'heart-outline','Dualar ve Zikirler'],
    [tabs[4],'calendar-outline','Dini Takvim'],
    [tabs[6],'settings-outline','Ayarlar']
  ].map(([target,icon,label])=>(
    <Pressable key={target}
      onPress={()=>{setTab(target);kuranScrollRef.current?.scrollTo({y:0,animated:false});}}
      style={{flexDirection:'row',alignItems:'center',padding:18,borderBottomWidth:1,borderColor:'#34445F'}}>
      <Ionicons name={icon} size={26} color="#E7C77B"/>
      <Text style={{flex:1,color:'#FFFFFF',fontSize:17,marginLeft:14}}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#E7C77B"/>
    </Pressable>
  ))}
</View>}
<Text style={s.footer}>VAKTİM · Huzurla hatırla</Text>
    </ScrollView>
  
<View style={{flexDirection:'row',backgroundColor:'#101D33',borderTopWidth:1,borderColor:'#806B42',paddingVertical:10,paddingHorizontal:4}}>
  {[
    [tabs[0],'time-outline','Vakitler'],
    [tabs[1],'compass-outline','Kıble'],
    [tabs[5],'book-outline',"Kur'an"],
    [tabs[3],'finger-print-outline','Tesbih'],
    ['Menü','grid-outline','Menü']
  ].map(([target,icon,label])=>{
    const active = tab===target || (target==='Menü' && [tabs[2],tabs[4],tabs[6]].includes(tab));
    return (
      <Pressable key={target}
        onPress={()=>{
          setSelectedSure(null);
          setTab(target);
          kuranScrollRef.current?.scrollTo({y:0,animated:false});
        }}
        style={{flex:1,alignItems:'center',paddingVertical:8,borderRadius:12,backgroundColor:active?'#E7C77B22':'transparent'}}>
        <Ionicons name={icon} size={24} color={active?'#E7C77B':'#AAB9CF'}/>
        <Text style={{fontSize:11,marginTop:5,fontWeight:'bold',color:active?'#E7C77B':'#AAB9CF'}}>{label}</Text>
      </Pressable>
    );
  })}
</View>

{!vaktimAcilisHazir && (
  <View style={{position:'absolute',top:0,bottom:0,left:0,right:0,zIndex:999,elevation:99,backgroundColor:'#07152C'}}>
    <VaktimBackground
      source={require('./assets/vaktim-splash.jpg')}
      resizeMode="contain"
      style={{flex:1,width:'100%'}}
    />
    <View style={{alignItems:'center',paddingBottom:35}}>
      <SplashSpinner size="large" color="#E7C77B"/>
      <Text style={{color:'#E7C77B',fontSize:15,marginTop:12}}>
        VAKTİM hazırlanıyor...
      </Text>
    </View>
  </View>
)}
</SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:'#090F20'},page:{padding:20,paddingBottom:36},
 header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:10,marginBottom:24},
 brand:{color:'#E7C77B',fontSize:28,fontWeight:'900',letterSpacing:3},sub:{color:'#8994AA',fontSize:12,marginTop:3},
 cityBtn:{backgroundColor:'#18233B',borderColor:'#34425D',borderWidth:1,paddingHorizontal:13,paddingVertical:10,borderRadius:20},cityText:{color:'#E6D6AF',fontWeight:'600'},
 dateBox:{alignItems:'center',marginBottom:18},date:{color:'#F2F3F7',fontSize:16,fontWeight:'700'},hijri:{color:'#8994AA',fontSize:11,marginTop:5},
 hero:{alignItems:'center',overflow:'hidden',borderWidth:1,backgroundColor:'#10213BDD',borderColor:'#B99A58',borderRadius:28,padding:22},
 eyebrow:{color:'#D9BD7B',fontSize:11,letterSpacing:2,fontWeight:'800'},next:{color:'#FFFFFF',fontSize:32,fontWeight:'800',marginTop:10},nextTime:{color:'#E8CC8B',fontSize:22,fontWeight:'700',marginTop:2},countLabel:{color:'#AAB5C8',fontSize:12,marginTop:18},count:{color:'#FFFFFF',fontSize:30,fontWeight:'800',letterSpacing:3,marginTop:4},moon:{position:'absolute',right:18,top:15,opacity:.13},moonText:{fontSize:85,color:'#F6D98F'},
 tabs:{flexDirection:'row',backgroundColor:'#111B30',borderRadius:15,padding:5,marginTop:20,marginBottom:14},tab:{flex:1,padding:11,alignItems:'center',borderRadius:11},tabOn:{backgroundColor:'#D9BD7B'},tabText:{color:'#AAB5C8',fontWeight:'700',fontSize:13},tabTextOn:{color:'#18233B'},
 card:{borderWidth:1,backgroundColor:'#0B1B32DD',borderColor:'#806B4266',borderRadius:24,padding:16},section:{fontWeight:'900',letterSpacing:1.5,marginBottom:12,color:'#E7C77B',fontSize:13},
 prayerRow:{borderTopColor:'#24314A',flexDirection:'row',alignItems:'center',justifyContent:'space-between',height:48,borderTopWidth:0,backgroundColor:'#20334D88',borderRadius:12,paddingHorizontal:12,marginBottom:5},prayerLeft:{flexDirection:'row',alignItems:'center'},prayerIcon:{color:'#D9BD7B',width:30,fontSize:17},prayerName:{color:'#E9EDF5',fontSize:15,fontWeight:'600'},prayerTime:{color:'#FFFFFF',fontSize:16,fontWeight:'800'},gold:{color:'#E9CC83'},
 note:{color:'#8F9BB0',fontSize:11,lineHeight:17,marginTop:12},locationBtn:{borderWidth:1,borderColor:'#59637A',padding:15,borderRadius:14,alignItems:'center,',marginTop:16},locationText:{color:'#DCE3F0',fontWeight:'700'},notifyBtn:{backgroundColor:'#D9BD7B',padding:16,borderRadius:14,alignItems:'center',marginTop:10},notifyOn:{backgroundColor:'#253C38'},notifyText:{color:'#10192A',fontWeight:'800'},footer:{fontSize:11,textAlign:'center',marginTop:25,letterSpacing:1,color:'#C7B88F'},
 compass:{alignSelf:'center',marginVertical:18,alignItems:'center',justifyContent:'center',width:220,height:220,borderRadius:110,backgroundColor:'#10213DDD',borderColor:'#E7C77B',borderWidth:3},compassN:{position:'absolute',top:10,color:'#D9BD7B',fontWeight:'900'},needle:{fontSize:65,color:'#FFD580',transform:[{rotate:'-45deg'}]},kaaba:{position:'absolute',bottom:25,color:'#E9CC83',fontSize:25},qiblaText:{textAlign:'center',color:'#FFFFFF',fontWeight:'800',fontSize:19},
 dua:{paddingVertical:13,borderBottomWidth:1,borderBottomColor:'#26344E'},duaTitle:{color:'#E9CC83',fontWeight:'800',fontSize:14},arabic:{color:'#FFFFFF',fontSize:22,textAlign:'right',marginTop:10}
});
