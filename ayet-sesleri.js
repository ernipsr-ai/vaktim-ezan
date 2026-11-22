import sureler from './sureler.json';

export const ayetSesAdresi = (sureNo, ayetNo) => {
  const oncekiAyetler = sureler
    .filter(s => s.number < sureNo)
    .reduce((toplam, s) => toplam + s.numberOfAyahs, 0);

  const genelAyetNo = oncekiAyetler + ayetNo;

  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${genelAyetNo}.mp3`;
};
