
export interface HeaderConfig {
  title: string;
  backgroundImage: string;
}

export const HEADER_CONFIGS: Record<string, HeaderConfig> = {
  '/': {
    title: 'Hangakadémia webshop',
    backgroundImage: '/assets/bg.webp'
  },
  '/oktatasok': {
    title: 'Oktatások',
    backgroundImage: '/images/Oktatas.webp'
  },
  '/galeria': {
    title: 'Galéria',
    backgroundImage: '/images/Gallery_BG1.webp'
  },
  '/kapcsolat': {
    title: 'Kapcsolat',
    backgroundImage: '/images/kapcsolat.webp'
  },
  '/rolam': {
    title: 'Rólam',
    backgroundImage: '/images/Hangtal-bg.webp'
  },
  '/shop': {
    title: 'Webshop',
    backgroundImage: '/assets/bg.webp'
  },
  '/login': {
    title: 'Bejelentkezés',
    backgroundImage: '/assets/bg.webp'
  },
  '/hangterapia': {
      title: 'Hangterápia',
      backgroundImage: '/images/Adri-terapia-08.webp'
  },
  '/hangtalak': {
      title: 'Himalájai hangtálak',
      backgroundImage: '/images/Himalajai_talak.webp'
  },
  '/hangtal-masszazs': {
      title: 'Himalájai Hangtálmasszázs®',
      backgroundImage: '/images/hangtalmasszazs-01.webp'
  },
  '/tudomanyos-alapok': {
      title: 'Tudományos alapok',
      backgroundImage: '/images/TudomanyosHatter-05.webp'
  },
  '/eszkozok-hangok': {
      title: 'Eszközök és hangok',
      backgroundImage: '/images/Adri-terapia-09.webp'
  },
  '/media': {
      title: 'Média megjelenések',
      backgroundImage: '/images/Magazine.webp'
  },
  '/alkalmazasi-terulet': {
      title: 'Alkalmazási terület',
      backgroundImage: '/images/Alkalmazasi_Teruletek.webp'
  },
  '/menete': {
      title: 'Hangtálmasszázs® menete',
      backgroundImage: '/images/Alkalmazasi_Menete.webp'
  },
  '/arak': {
      title: 'Árak',
      backgroundImage: '/images/Adri-terapia-10.webp'
  }
};

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  title: 'Hangakadémia',
  backgroundImage: '/assets/bg.webp'
};
