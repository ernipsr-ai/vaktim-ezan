import React, {useEffect, useMemo, useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform} from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import {Coordinates, CalculationMethod, PrayerTimes, Qibla} from 'adhan';
import {StatusBar} from 'expo-status-bar';

const CITIES = {
  'İstanbul': [41.0082, 28.9784],
  'Ankara': [39.9334, 32.8597],
  'İzmir': [38.4237, 27.1428],
  'Bursa': [40.1885, 29.0610],
  'Antalya': [36.8969, 30.7133],
  'Konya': [37.8746, 32.4932],
  'Adana': [37.0000, 35.3213],
  'Trabzon': [41.0027, 39.7168],
  'Gaziantep': [37.0662, 37.3833],
  'Diyarbakır': [37.9144, 40.2306]
};
const NAMES = [['fajr','İmsak'],['sunrise','Güneş'],['dhuhr','Öğle'],['asr','İkindi'],['maghrib','Akşam'],['isha','Yatsı']];
const fmt = d => d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
const dateText = d => d.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

export default function App() {
  const [city,setCity] = useState('İstanbul');
  const [coords,setCoords] = useState(CITIES['İstanbul']);
  const [locLabel,setLocLabel] = useState('Şehir seçimi');
  const [tab,setTab] = useState('Vakitler');
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
      setCoords([l.coords.latitude,l.coords.longitude]); setLocLabel('Mevcut konum');
      const rev=await Location.reverseGeocodeAsync({latitude:l.coords.latitude,longitude:l.coords.longitude});
      if(rev[0]?.city) setCity(rev[0].city);
    } catch(e){Alert.alert('Konum alınamadı','Lütfen şehir listesinden seçim yap.');}
  }

  async function chooseCity(){
    const names=Object.keys(CITIES);
    Alert.alert('Şehir seç', 'Namaz vakitleri için şehir seç:', names.map(n=>({text:n,onPress:()=>{setCity(n);setCoords(CITIES[n]);setLocLabel('Şehir seçimi');}})).concat([{text:'İptal',style:'cancel'}]));
  }

  async function toggleNotifications(){
    try {
      const {status}=await Notifications.requestPermissionsAsync();
      if(status!=='granted'){Alert.alert('Bildirim izni kapalı','Telefon ayarlarından VAKTİM bildirimlerine izin verebilirsin.');return;}
      await Notifications.cancelAllScheduledNotificationsAsync();
      const times=prayerData.items.filter(x=>x.key!=='sunrise');
      for(const p of times){
        const d=new Date(p.time);
        if(d>now) await Notifications.scheduleNotificationAsync({
          content:{title:`${p.label} vakti`,body:`${city} için ${p.label} namazı vakti girdi.`,sound:true},
          trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:d}
        });
      }
      setNotifications(true);
      Alert.alert('Bildirimler hazır','Bugünün kalan namaz vakitleri için bildirimler kuruldu. Yarın için uygulamayı yeniden açıp bildirimleri yenile.');
    } catch(e){Alert.alert('Hata','Bildirimler kurulamadı.');}
  }

  const qibla = Qibla(new Coordinates(coords[0],coords[1]));
  const tabs=['Vakitler','Kıble','Dualar'];
  return <SafeAreaView style={s.safe}><StatusBar style="light"/>
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.header}><View><Text style={s.brand}>VAKTİM</Text><Text style={s.sub}>Vaktin huzur olsun</Text></View><Pressable style={s.cityBtn} onPress={chooseCity}><Text style={s.cityText}>⌖  {city} ▾</Text></Pressable></View>
      <View style={s.dateBox}><Text style={s.date}>{dateText(now)}</Text><Text style={s.hijri}>Namaz vakitleri · Türkiye hesaplama yöntemi</Text></View>
      <View style={s.hero}>
        <Text style={s.eyebrow}>SIRADAKİ VAKİT</Text><Text style={s.next}>{nextPrayer.label}</Text>
        <Text style={s.nextTime}>{fmt(nextPrayer.time)}</Text><Text style={s.countLabel}>Kalan süre</Text><Text style={s.count}>{countdown}</Text>
        <View style={s.moon}><Text style={s.moonText}>☾</Text></View>
      </View>
      <View style={s.tabs}>{tabs.map(t=><Pressable key={t} onPress={()=>setTab(t)} style={[s.tab,tab===t&&s.tabOn]}><Text style={[s.tabText,tab===t&&s.tabTextOn]}>{t}</Text></Pressable>)}</View>
      {tab==='Vakitler'&&<View style={s.card}>
        <Text style={s.section}>BUGÜNÜN VAKİTLERİ</Text>
        {prayerData.items.map((p,i)=><View key={p.key} style={[s.prayerRow,i===0&&{borderTopWidth:0}]}><View style={s.prayerLeft}><Text style={s.prayerIcon}>{['☀','◉','☼','◒','☾','✦'][i]}</Text><Text style={s.prayerName}>{p.label}</Text></View><Text style={[s.prayerTime,p.key===nextPrayer.label?.toLowerCase()&&s.gold]}>{fmt(p.time)}</Text></View>)}
        <Text style={s.note}>Vakitler seçilen konuma ve Türkiye hesaplama yöntemine göre hesaplanır.</Text>
      </View>}
      {tab==='Kıble'&&<View style={s.card}><Text style={s.section}>KIBLE YÖNÜ</Text><View style={s.compass}><Text style={s.compassN}>K</Text><Text style={s.needle}>➤</Text><Text style={s.kaaba}>▣</Text></View><Text style={s.qiblaText}>Kıble açısı: {Math.round(qibla)}°</Text><Text style={s.note}>Bu sürümde kıble açısı kuzeye göre gösterilir. Pusula yönünü doğru kullanmak için telefonun sensör kalibrasyonu gerekir.</Text></View>}
      {tab==='Dualar'&&<View style={s.card}><Text style={s.section}>GÜNLÜK DUA VE ZİKİRLER</Text>{[['Sabah zikri','سُبْحَانَ اللَّهِ وَبِحَمْدِهِ','Allah’ı hamdiyle tesbih ederim.'],['Tesbih','سُبْحَانَ اللَّهِ','Allah’ı her türlü noksanlıktan tenzih ederim.'],['Hamd','الْحَمْدُ لِلَّهِ','Hamd Allah’a mahsustur.'],['Tekbir','اللَّهُ أَكْبَرُ','Allah en büyüktür.']].map((d,i)=><View key={i} style={s.dua}><Text style={s.duaTitle}>{d[0]}</Text><Text style={s.arabic}>{d[1]}</Text><Text style={s.note}>{d[2]}</Text></View>)}</View>}
      <Pressable style={s.locationBtn} onPress={useLocation}><Text style={s.locationText}>◎  Mevcut konumumu kullan</Text></Pressable>
      <Pressable style={[s.notifyBtn,notifications&&s.notifyOn]} onPress={toggleNotifications}><Text style={s.notifyText}>{notifications?'✓  Bildirim izni açık · Vakitleri yenile':'♢  Ezan vakti bildirimlerini aç'}</Text></Pressable>
      <Text style={s.footer}>VAKTİM · Huzurla hatırla</Text>
    </ScrollView>
  </SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:'#090F20'},page:{padding:20,paddingBottom:36},
 header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:10,marginBottom:24},
 brand:{color:'#E7C77B',fontSize:28,fontWeight:'900',letterSpacing:3},sub:{color:'#8994AA',fontSize:12,marginTop:3},
 cityBtn:{backgroundColor:'#18233B',borderColor:'#34425D',borderWidth:1,paddingHorizontal:13,paddingVertical:10,borderRadius:20},cityText:{color:'#E6D6AF',fontWeight:'600'},
 dateBox:{alignItems:'center',marginBottom:18},date:{color:'#F2F3F7',fontSize:16,fontWeight:'700'},hijri:{color:'#8994AA',fontSize:11,marginTop:5},
 hero:{backgroundColor:'#172641',borderRadius:25,padding:25,alignItems:'center',overflow:'hidden',borderWidth:1,borderColor:'#34445F'},
 eyebrow:{color:'#D9BD7B',fontSize:11,letterSpacing:2,fontWeight:'800'},next:{color:'#FFFFFF',fontSize:32,fontWeight:'800',marginTop:10},nextTime:{color:'#E8CC8B',fontSize:22,fontWeight:'700',marginTop:2},countLabel:{color:'#AAB5C8',fontSize:12,marginTop:18},count:{color:'#FFFFFF',fontSize:30,fontWeight:'800',letterSpacing:3,marginTop:4},moon:{position:'absolute',right:18,top:15,opacity:.13},moonText:{fontSize:85,color:'#F6D98F'},
 tabs:{flexDirection:'row',backgroundColor:'#111B30',borderRadius:15,padding:5,marginTop:20,marginBottom:14},tab:{flex:1,padding:11,alignItems:'center',borderRadius:11},tabOn:{backgroundColor:'#D9BD7B'},tabText:{color:'#AAB5C8',fontWeight:'700',fontSize:13},tabTextOn:{color:'#18233B'},
 card:{backgroundColor:'#111B30',borderRadius:20,padding:18,borderWidth:1,borderColor:'#26344E'},section:{color:'#D9BD7B',fontSize:11,fontWeight:'900',letterSpacing:1.5,marginBottom:12},
 prayerRow:{height:52,borderTopWidth:1,borderTopColor:'#24314A',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},prayerLeft:{flexDirection:'row',alignItems:'center'},prayerIcon:{color:'#D9BD7B',width:30,fontSize:17},prayerName:{color:'#E9EDF5',fontSize:15,fontWeight:'600'},prayerTime:{color:'#FFFFFF',fontSize:16,fontWeight:'800'},gold:{color:'#E9CC83'},
 note:{color:'#8F9BB0',fontSize:11,lineHeight:17,marginTop:12},locationBtn:{borderWidth:1,borderColor:'#59637A',padding:15,borderRadius:14,alignItems:'center,',marginTop:16},locationText:{color:'#DCE3F0',fontWeight:'700'},notifyBtn:{backgroundColor:'#D9BD7B',padding:16,borderRadius:14,alignItems:'center',marginTop:10},notifyOn:{backgroundColor:'#253C38'},notifyText:{color:'#10192A',fontWeight:'800'},footer:{color:'#66738A',fontSize:11,textAlign:'center',marginTop:25,letterSpacing:1},
 compass:{width:190,height:190,borderRadius:100,borderWidth:2,borderColor:'#D9BD7B',alignSelf:'center',marginVertical:18,alignItems:'center',justifyContent:'center'},compassN:{position:'absolute',top:10,color:'#D9BD7B',fontWeight:'900'},needle:{fontSize:65,color:'#E9CC83',transform:[{rotate:'-45deg'}]},kaaba:{position:'absolute',bottom:25,color:'#E9CC83',fontSize:25},qiblaText:{textAlign:'center',color:'#FFFFFF',fontWeight:'800',fontSize:19},
 dua:{paddingVertical:13,borderBottomWidth:1,borderBottomColor:'#26344E'},duaTitle:{color:'#E9CC83',fontWeight:'800',fontSize:14},arabic:{color:'#FFFFFF',fontSize:22,textAlign:'right',marginTop:10}
});
