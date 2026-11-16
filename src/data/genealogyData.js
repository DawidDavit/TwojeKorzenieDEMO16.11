// Kompleksowe dane platformy genealogicznej TwojeKorzenie
// Wyraźne rozróżnienie między danymi przykładowymi (TRYB DEMONSTRACYJNY) a aktywnym zleceniem klienta (BADANIA W TOKU)

export const SERVICES_CATALOG = [
  {
    id: 'odkrywanie-przodkow',
    title: 'Odkrywanie przodków',
    subtitle: 'Badania genealogiczne',
    price: '2 400 zł brutto',
    priceNetto: '1 951,22 zł netto + 23% VAT (448,78 zł)',
    priceNumeric: 2400,
    valuationInfo: 'Cena całkowita za etap I–III • 0 zł ukrytych opłat • Bezpłatna wstępna ocena zachowania ksiąg (7 dni)',
    illustrationType: 'compass-archives',
    badge: 'Kwerenda Archiwalna',
    shortDesc: 'Profesjonalne poszukiwania w archiwach państwowych, kościelnych i wojskowych w Polsce oraz za granicą.',
    fullDesc: 'Nasi historycy i archiwiści przeprowadzają wieloetapową kwerendę w księgach metrykalnych (urodzeń, małżeństw, zgonów), spisach ludności, aktach notarialnych oraz archiwach wojskowych. Przed podpisaniem umowy bezpłatnie weryfikujemy stan zachowania akt w archiwach i uczciwie informujemy o możliwym zasięgu badawczym.',
    benefits: [
      'Kwerenda w archiwach państwowych i parafialnych (weryfikacja stanu zachowania akt)',
      'Tłumaczenie aktów z łaciny, cyrylicy i pisma neogotyckiego',
      'Weryfikacja nazwisk, oboczności i dawnych miejscowości',
      'Raport genealogiczny z sygnaturami źródeł historycznych (bez ukrytych dopłat)'
    ],
    duration: '6–10 tygodni',
    generations: 'Zależnie od zachowanych ksiąg (zwykle 4–5 pokoleń)'
  },
  {
    id: 'drzewo-genealogiczne',
    title: 'Drzewo genealogiczne',
    subtitle: 'Profesjonalne opracowanie historii rodziny',
    price: '3 200 zł brutto',
    priceNetto: '2 601,63 zł netto + 23% VAT (598,37 zł)',
    priceNumeric: 3200,
    valuationInfo: 'Cena całkowita z VAT • Zawiera interaktywne drzewo online (0 zł abonamentu) + druk muzealny i wysyłkę',
    illustrationType: 'royal-tree',
    badge: 'Najczęściej Wybierany',
    shortDesc: 'Artystyczna i naukowa wizualizacja pokoleń Twojej rodziny w formie interaktywnej mapy oraz wydruku kolekcjonerskiego.',
    fullDesc: 'Tworzymy kompletne drzewo przodków (ascendentów) lub potomków (descendentów), ukazujące udokumentowane powiązania między liniami macierzystymi i ojczystymi. Otrzymujesz zarówno dostęp do dynamicznej mapy drzewa w Panelu Klienta, jak i wielkoformatowy wydruk na papierze bawełnianym z tłoczeniami w kolorze antycznego złota.',
    benefits: [
      'Interaktywne drzewo 2D z nawigacją i profilami przodków (bez opłat miesięcznych)',
      'Opracowanie linii męskiej i żeńskiej na bazie zachowanych metryk',
      'Kolekcjonerski wydruk na bezkwasowym papierze archiwalnym (wliczony w cenę)',
      'Karty biograficzne każdego odnalezionego członka rodu'
    ],
    duration: '8–12 tygodni',
    generations: 'Do 6 pokoleń (obie linie, zależnie od dostępności źródeł)'
  },
  {
    id: 'historia-rodzinna',
    title: 'Historia rodzinna',
    subtitle: 'Dokumentacja losów przodków',
    price: '4 500 zł brutto',
    priceNetto: '3 658,54 zł netto + 23% VAT (841,46 zł)',
    priceNumeric: 4500,
    valuationInfo: 'Cena całkowita z VAT • Obejmuje redakcję historyczną, mapy migracji i 1 egzemplarz Księgi Rodu',
    illustrationType: 'chronicle-book',
    badge: 'Storytelling Historyczny',
    shortDesc: 'Przekształcamy potwierdzone fakty z archiwów w poruszającą, chronologiczną opowieść o życiu, wyborach i podróżach Twoich przodków.',
    fullDesc: 'Poznaj udokumentowaną codzienność swoich pradziadków: czym się zajmowali, w jakich domach mieszkali, jakie wydarzenia historyczne wpłynęły na ich losy. Nasi redaktorzy historyczni łączą fakty metrykalne z prasą z epoki, mapami katastralnymi i kronikami lokalnymi, wyraźnie oddzielając fakty źródłowe od kontekstu epoki.',
    benefits: [
      'Chronologiczne opowieści biograficzne oparte na zweryfikowanych źródłach',
      'Interaktywne mapy miejsc zamieszkania i szlaków migracji',
      'Kontekst historyczny epoki i prasa archiwalna z lat życia przodków',
      'Skład i oprawa introligatorska Księgi Historii Rodziny (w cenie usługi)'
    ],
    duration: '10–14 tygodni',
    generations: 'Pełna narracja wielopokoleniowa'
  },
  {
    id: 'archiwum-rodzinne',
    title: 'Archiwum rodzinne',
    subtitle: 'Odnajdywanie, porządkowanie i digitalizacja dokumentów oraz fotografii',
    price: '1 900 zł brutto',
    priceNetto: '1 544,72 zł netto + 23% VAT (355,28 zł)',
    priceNumeric: 1900,
    valuationInfo: 'Cena całkowita za pakiet do 50 obiektów • 0 zł za utrzymanie chmury archiwalnej',
    illustrationType: 'digital-vault',
    badge: 'Konserwacja i Digitalizacja',
    shortDesc: 'Zabezpieczamy domowe pamiątki, retuszujemy stare fotografie i łączymy je z dokumentami z archiwów w jednym cyfrowym skarbcu.',
    fullDesc: 'Stare fotografie na tekturkach, pożółkłe listy z frontu, akty notarialne i legitymacje zyskują drugie życie. Przeprowadzamy bezinwazyjne skanowanie w wysokiej rozdzielczości, cyfrową rekonstrukcję uszkodzeń oraz pełne skatalogowanie każdego obiektu w Twoim Prywatnym Archiwum Cyfrowym.',
    benefits: [
      'Digitalizacja w jakości muzealnej (600–1200 DPI) i retusz fotografii (do 50 szt.)',
      'Transkrypcja i odczytanie odręcznych listów oraz pamiętników',
      'Powiązanie każdego dokumentu z konkretną osobą w drzewie',
      'Bezpieczna chmura archiwalna z możliwością udostępnienia rodzinie (0 zł abonamentu)'
    ],
    duration: '3–6 tygodni',
    generations: 'Pakiet do 50 dokumentów/fotografii domowych'
  },
  {
    id: 'pakiet-kompleksowy',
    title: 'Pakiet kompleksowy',
    subtitle: 'Pełna podróż przez historię rodziny',
    price: '8 900 zł brutto',
    priceNetto: '7 235,77 zł netto + 23% VAT (1 664,23 zł)',
    priceNumeric: 8900,
    valuationInfo: 'Cena całkowita z VAT • Możliwość płatności w 3 transzach etapowych (0% prowizji) • Opiekun naukowy',
    illustrationType: 'imperial-crest',
    badge: 'Oferta Flagowa VIP',
    shortDesc: 'Kompletne dzieło genealogiczne: pełne badania archiwalne, interaktywne drzewo, ilustrowana kronika rodu i cyfrowe archiwum rodzinne.',
    fullDesc: 'Najbardziej kompleksowa usługa TwojeKorzenie. Dedykowany zespół genealogów, historyków i archiwistów prowadzi badania historyczne w dostępnych źródłach polskich i zagranicznych. Efekt badań prezentujemy w prywatnym Panelu Klienta oraz w ręcznie oprawionej Księdze Dziedzictwa.',
    benefits: [
      'Kompleksowe badania linii rodzinnych w zachowanych zbiorach krajowych i zagranicznych',
      'Bezterminowy dostęp do Panelu Klienta, Drzewa 2D i Cyfrowego Archiwum (0 zł abonamentu)',
      'Ręcznie szyta Księga Rodu w oprawie introligatorskiej ze złotym tłoczeniem',
      'Indywidualna prezentacja wyników badań oraz pełna dokumentacja źródłowa'
    ],
    duration: '12–18 tygodni',
    generations: 'Pełny dostępny zasięg zachowanych źródeł (XVIII–XX w.)'
  }
];

export const COLLABORATION_STEPS = [
  {
    step: '01',
    title: 'Wybierasz usługę',
    description: 'Dobierasz pakiet dopasowany do Twoich potrzeb lub korzystasz z bezpłatnej konsultacji z naszym głównym genealogiem.',
    detail: 'Określamy zakres badań, interesujące Cię linie rodowe (mieczowa, kądzieli lub pełny wywód przodków) oraz harmonogram prac.'
  },
  {
    step: '02',
    title: 'Przekazujesz dostępne informacje o rodzinie',
    description: 'Przez bezpieczny formularz w Panelu Klienta lub rozmowę z opiekunem dzielisz się tym, co już wiesz – nawet jeśli to tylko jedno nazwisko i przybliżona miejscowość.',
    detail: 'Każda rodzinna legenda, stara fotografia z podpisem na odwrocie czy odpis aktu z USC stanowi punkt wyjścia do kwerendy.'
  },
  {
    step: '03',
    title: 'Nasi genealogowie prowadzą badania',
    description: 'Historycy wyruszają do Archiwów Państwowych, parafii, archiwów kresowych i wojskowych. Na bieżąco widzisz postęp badań w swoim panelu.',
    detail: 'Odczytujemy XVIII i XIX-wieczne księgi pisane po łacinie, rosyjsku i niemiecku, weryfikując każde ogniwo pokoleniowe.'
  },
  {
    step: '04',
    title: 'Otrzymujesz gotową historię rodzinną',
    description: 'Opracowujemy wyniki w formie spójnej opowieści, map migracji, biogramów przodków oraz kolekcjonerskiej Księgi Rodu.',
    detail: 'Każdy fakt jest udokumentowany skanem oryginalnego aktu oraz przypisem archiwalnym.'
  },
  {
    step: '05',
    title: 'Logujesz się do własnego cyfrowego archiwum',
    description: 'Otrzymujesz bezterminowy dostęp (0 zł abonamentu) do prywatnej przestrzeni TwojeKorzenie, w której wraz z bliskimi odkrywasz drzewo, dokumenty i historie przodków.',
    detail: 'Możesz zapraszać członków rodziny, powiększać skany dokumentów i dopisywać współczesne wspomnienia.'
  }
];

// Przykładowi przodkowie (Bogate dane demonstracyjne - Ród Korzeniowskich, Wielowiejskich i Zamoyskich)
export const DEMO_ANCESTORS = [
  {
    id: 'anc-1',
    firstName: 'Janusz',
    lastName: 'Korzeniowski',
    maidenName: null,
    generation: 1,
    generationLabel: 'Pokolenie I (Proband / Klient)',
    role: 'Wnuk / Właściciel Archiwum',
    birthDate: '14 maja 1978',
    birthYear: 1978,
    deathDate: 'żyje',
    deathYear: null,
    birthPlace: 'Kraków',
    region: 'Małopolska',
    coordinates: { x: 54, y: 78, city: 'Kraków', period: '1978 – obecnie' },
    profession: 'Architekt konserwator zabytków',
    coatOfArms: 'Nałęcz (linia małopolska)',
    portraitSeed: 'janusz-1978',
    portraitTone: '#2E5947',
    parentIds: ['anc-2', 'anc-3'],
    spouseId: 'anc-10',
    siblingIds: ['anc-9'],
    childrenIds: [],
    isVerified: true,
    verificationSource: 'Odpis zupełny aktu urodzenia USC Kraków Śródmieście',
    shortBio: 'Współczesny kustosz pamiątek rodzinnych. Zainicjował kompleksowe badania genealogiczne w celu odtworzenia losów przodków z Lwowa, Wilna i Krakowa.',
    storyParagraphs: [
      'Janusz Korzeniowski urodził się wiosną 1978 roku w Krakowie, w kamienicy przy ulicy Retoryka, w której rodzina zamieszkała po powojennej repatriacji ze Lwowa. Od najmłodszych lat otaczały go dębowe meble przywiezione z Kresów oraz szuflada pełna pożółkłych fotografii z atelier „Trzemeski” we Lwowie.',
      'Jako architekt specjalizujący się w rewaloryzacji historycznych obiektów, postanowił połączyć rozproszone przekazy ustne z rygorystyczną kwerendą archiwalną. Dzięki badaniom udało się udokumentować nieprzerwaną linię rodu sięgającą końca XVIII wieku.'
    ],
    lifeEvents: [
      { year: '1978', title: 'Narodziny w Krakowie', place: 'Kraków', desc: 'Przychodzi na świat jako syn profesora Adama Korzeniowskiego i Marii z domu Wielowiejskiej.' },
      { year: '2003', title: 'Dyplom Wydziału Architektury PK', place: 'Kraków', desc: 'Obrona pracy dyplomowej poświęconej architekturze dworów ziemiańskich dawnej Galicji.' },
      { year: '2008', title: 'Ślub z Julią z domu Ostrowską', place: 'Kraków, Kościół św. Anny', desc: 'Uroczystość rodzinna, podczas której odnaleziono XIX-wieczny sygnet rodowy pradziadka Ignacego.' },
      { year: '2026', title: 'Otwarcie Cyfrowego Archiwum Rodu', place: 'Kraków / Warszawa', desc: 'Zakończenie IV etapu kwerendy archiwalnej z zespołem TwojeKorzenie.' }
    ],
    residences: [
      { city: 'Kraków, ul. Retoryka 14', years: '1978–2005', x: 54, y: 78, note: 'Rodzinne mieszkanie pełne pamiątek ze Lwowa' },
      { city: 'Kraków, Salwator', years: '2005–obecnie', x: 52, y: 79, note: 'Obecny dom rodzinny i pracownia architektoniczna' }
    ]
  },
  {
    id: 'anc-9',
    firstName: 'Klara',
    lastName: 'Korzeniowska-Nowak',
    maidenName: 'Korzeniowska',
    generation: 1,
    generationLabel: 'Pokolenie I (Rodzeństwo)',
    role: 'Siostra',
    birthDate: '3 listopada 1982',
    birthYear: 1982,
    deathDate: 'żyje',
    deathYear: null,
    birthPlace: 'Kraków',
    region: 'Małopolska / Dolny Śląsk',
    coordinates: { x: 35, y: 68, city: 'Wrocław', period: '2007 – obecnie' },
    profession: 'Historyczka sztuki, kuratorka muzealna',
    coatOfArms: 'Nałęcz',
    portraitSeed: 'klara-1982',
    portraitTone: '#4A6B5D',
    parentIds: ['anc-2', 'anc-3'],
    spouseId: null,
    siblingIds: ['anc-1'],
    childrenIds: [],
    isVerified: true,
    verificationSource: 'Archiwum rodzinne Korzeniowskich',
    shortBio: 'Młodsza siostra Janusza, badaczka malarstwa Młodej Polski. Opiekuje się kolekcją listów prababci Heleny z Wilna.',
    storyParagraphs: [
      'Klara odziedziczyła po babci Zofii zamiłowanie do muzyki fortepianowej oraz sztuk pięknych. Podczas porządkowania rodzinnej biblioteki we Wrocławiu natrafiła na zeszyt z odręcznymi zapiskami z 1919 roku, co otworzyło zupełnie nowy rozdział badań nad wileńską gałęzią rodziny.'
    ],
    lifeEvents: [
      { year: '1982', title: 'Narodziny w Krakowie', place: 'Kraków', desc: 'Córka Adama i Marii Korzeniowskich.' },
      { year: '2007', title: 'Przeprowadzka do Wrocławia', place: 'Wrocław', desc: 'Objęcie stanowiska kustosza w dziale rzemiosła artystycznego.' }
    ],
    residences: [
      { city: 'Kraków', years: '1982–2007', x: 54, y: 78, note: 'Dom rodzinny' },
      { city: 'Wrocław, Biskupin', years: '2007–obecnie', x: 35, y: 68, note: 'Miejsce pracy naukowej' }
    ]
  },
  {
    id: 'anc-10',
    firstName: 'Julia',
    lastName: 'Korzeniowska',
    maidenName: 'Ostrowska',
    generation: 1,
    generationLabel: 'Pokolenie I (Małżonka)',
    role: 'Małżonka',
    birthDate: '22 sierpnia 1980',
    birthYear: 1980,
    deathDate: 'żyje',
    deathYear: null,
    birthPlace: 'Poznań',
    region: 'Wielkopolska',
    coordinates: { x: 34, y: 46, city: 'Poznań', period: '1980–2006' },
    profession: 'Lekarz kardiolog',
    coatOfArms: 'Rawicz (linia wielkopolska)',
    portraitSeed: 'julia-1980',
    portraitTone: '#8C6B37',
    parentIds: [],
    spouseId: 'anc-1',
    siblingIds: [],
    childrenIds: [],
    isVerified: true,
    verificationSource: 'Akt małżeństwa USC Kraków nr 412/2008',
    shortBio: 'Pochodzi z poznańskiej rodziny lekarskiej o tradycjach organicznikowskich sięgających połowy XIX wieku.',
    storyParagraphs: [
      'Julia z domu Ostrowska wniosła do wspólnego archiwum cenne dokumenty z zaboru pruskiego, w tym dyplom lekarski swojego pradziadka z Uniwersytetu w Berlinie z 1898 roku.'
    ],
    lifeEvents: [
      { year: '1980', title: 'Narodziny w Poznaniu', place: 'Poznań', desc: 'Przychodzi na świat w rodzinie wielkopolskich lekarzy.' },
      { year: '2008', title: 'Ślub z Januszem Korzeniowskim', place: 'Kraków', desc: 'Połączenie linii małopolsko-kresowej z wielkopolską.' }
    ],
    residences: [
      { city: 'Poznań, Jeżyce', years: '1980–2006', x: 34, y: 46, note: 'Dom rodzinny w Poznaniu' },
      { city: 'Kraków', years: '2006–obecnie', x: 54, y: 78, note: 'Klinika Uniwersytecka i dom rodzinny' }
    ]
  },
  {
    id: 'anc-2',
    firstName: 'Adam',
    lastName: 'Korzeniowski',
    maidenName: null,
    generation: 2,
    generationLabel: 'Pokolenie II (Rodzice)',
    role: 'Ojciec',
    birthDate: '9 września 1947',
    birthYear: 1947,
    deathDate: '18 stycznia 2021',
    deathYear: 2021,
    birthPlace: 'Kraków',
    region: 'Małopolska',
    coordinates: { x: 54, y: 78, city: 'Kraków', period: '1947–2021' },
    profession: 'Profesor filologii klasycznej UJ',
    coatOfArms: 'Nałęcz',
    portraitSeed: 'adam-1947',
    portraitTone: '#244638',
    parentIds: ['anc-4', 'anc-5'],
    spouseId: 'anc-3',
    siblingIds: [],
    childrenIds: ['anc-1', 'anc-9'],
    isVerified: true,
    verificationSource: 'Księga Chrztów Parafii św. Szczepana w Krakowie 1947',
    shortBio: 'Wybitny humanista i znawca antyku, urodzony dwa lata po przyjeździe rodziców ostatnim transportem ekspatriacyjnym ze Lwowa.',
    storyParagraphs: [
      'Profesor Adam Korzeniowski przyszedł na świat w 1947 roku w Krakowie, zaledwie kilkanaście miesięcy po tym, jak jego rodzice – Tadeusz i Zofia – opuścili rodzinny Lwów. Wychowany w atmosferze głębokiego szacunku dla słowa pisanego, całe życie zawodowe związał z Uniwersytetem Jagiellońskim.',
      'To on jako pierwszy spisał wspomnienia swojej matki Zofii i przechował w nienaruszonym stanie XIX-wieczne dokumenty majątkowe z Podola oraz Galicji Wschodniej.'
    ],
    lifeEvents: [
      { year: '1947', title: 'Narodziny w powojennym Krakowie', place: 'Kraków', desc: 'Pierwsze pokolenie rodziny urodzone po ekspatriacji ze Lwowa.' },
      { year: '1974', title: 'Małżeństwo z Marią Wielowiejską', place: 'Kraków, Kościół Mariacki', desc: 'Ślub zawarty w bazylice Mariackiej.' },
      { year: '1996', title: 'Nominacja profesorska', place: 'Warszawa / Kraków', desc: 'Odebranie tytułu profesora nauk humanistycznych.' },
      { year: '2021', title: 'Spoczynek na Cmentarzu Rakowickim', place: 'Kraków', desc: 'Pochowany w rodzinnym grobowcu kwatery PAS 42.' }
    ],
    residences: [
      { city: 'Kraków, ul. Krupnicza', years: '1947–1975', x: 53, y: 77, note: 'Pierwsze krakowskie mieszkanie po przyjeździe ze Lwowa' },
      { city: 'Kraków, ul. Retoryka 14', years: '1975–2021', x: 54, y: 78, note: 'Siedziba rodziny i prywatny księgozbiór' }
    ]
  },
  {
    id: 'anc-3',
    firstName: 'Maria',
    lastName: 'Korzeniowska',
    maidenName: 'Wielowiejska',
    generation: 2,
    generationLabel: 'Pokolenie II (Rodzice)',
    role: 'Matka',
    birthDate: '24 marca 1950',
    birthYear: 1950,
    deathDate: 'żyje',
    deathYear: null,
    birthPlace: 'Gdańsk',
    region: 'Pomorze / Wileńszczyzna',
    coordinates: { x: 48, y: 18, city: 'Gdańsk', period: '1950–1969' },
    profession: 'Konserwatorka starodruków i rękopisów',
    coatOfArms: 'Półkozic',
    portraitSeed: 'maria-1950',
    portraitTone: '#7D5B21',
    parentIds: ['anc-6', 'anc-7'],
    spouseId: 'anc-2',
    siblingIds: [],
    childrenIds: ['anc-1', 'anc-9'],
    isVerified: true,
    verificationSource: 'USC Gdańsk-Wrzeszcz nr 118/1950',
    shortBio: 'Córka wileńskich inteligentów osiadłych po wojnie w Gdańsku-Oliwie. Specjalistka konserwacji papieru czerpanego w Bibliotece Jagiellońskiej.',
    storyParagraphs: [
      'Maria z domu Wielowiejska urodziła się w 1950 roku w Gdańsku, dokąd jej rodzice – Stanisław i Helena – przybyli z Wilna. Podczas studiów w Krakowie poznała Adama Korzeniowskiego, łącząc dwie wielkie kresowe tradycje: lwowską i wileńską.',
      'Dzięki jej zawodowej wiedzy wszystkie rodzinne fotografie, listy i pergaminy przetrwały w doskonałej kondycji konserwatorskiej.'
    ],
    lifeEvents: [
      { year: '1950', title: 'Narodziny w Gdańsku-Oliwie', place: 'Gdańsk', desc: 'Córka Stanisława Wielowiejskiego i Heleny z domu Balińskiej.' },
      { year: '1969', title: 'Wyjazd na studia do Krakowa', place: 'Kraków', desc: 'Rozpoczęcie studiów z historii sztuki i konserwacji papieru.' },
      { year: '1974', title: 'Ślub z Adamem Korzeniowskim', place: 'Kraków', desc: 'Zawarcie związku małżeńskiego w Bazylice Mariackiej.' }
    ],
    residences: [
      { city: 'Gdańsk-Oliwa, ul. Polanki', years: '1950–1969', x: 48, y: 18, note: 'Dom rodzinny rodziców po przyjeździe z Wilna' },
      { city: 'Kraków, ul. Retoryka 14', years: '1974–obecnie', x: 54, y: 78, note: 'Dom rodzinny w Krakowie' }
    ]
  },
  {
    id: 'anc-4',
    firstName: 'Tadeusz',
    lastName: 'Korzeniowski',
    maidenName: null,
    generation: 3,
    generationLabel: 'Pokolenie III (Dziadkowie)',
    role: 'Dziadek (linia ojczysta)',
    birthDate: '19 listopada 1912',
    birthYear: 1912,
    deathDate: '4 października 1989',
    deathYear: 1989,
    birthPlace: 'Lwów',
    region: 'Galicja Wschodnia (Kresy Południowo-Wschodnie)',
    coordinates: { x: 84, y: 82, city: 'Lwów', period: '1912–1945' },
    profession: 'Inżynier kolei, absolwent Politechniki Lwowskiej',
    coatOfArms: 'Nałęcz',
    portraitSeed: 'tadeusz-1912',
    portraitTone: '#1E3F32',
    parentIds: ['anc-8'],
    spouseId: 'anc-5',
    siblingIds: [],
    childrenIds: ['anc-2'],
    isVerified: true,
    verificationSource: 'Księgi metrykalne Parafii św. Elżbiety we Lwowie (AGAD Warszawa, sygn. 301/1912)',
    shortBio: 'Absolwent Wydziału Komunikacji Politechniki Lwowskiej (1936), projektant mostów stalowych w II Rzeczypospolitej, uczestnik kampanii wrześniowej 1939 roku.',
    storyParagraphs: [
      'Tadeusz Korzeniowski przyszedł na świat 19 listopada 1912 roku we Lwowie jako syn sędziego apelacyjnego Ignacego Korzeniowskiego. Młodość spędził pomiędzy kamienicą przy ulicy Akademickiej a rodzinnym dworkiem letnim pod Złoczowem.',
      'W 1936 roku uzyskał z odznaczeniem dyplom inżyniera dróg i mostów na Politechnice Lwowskiej. W 1938 roku poślubił w Katedrze Łacińskiej we Lwowie utalentowaną pianistkę Zofię z domu Zamoyską. W 1945 roku, zabierając jedynie skrzynię z dokumentami rodowymi i skrzypce ojca, przedostał się z żoną do Krakowa.'
    ],
    lifeEvents: [
      { year: '1912', title: 'Chrzest w kościele św. Elżbiety we Lwowie', place: 'Lwów', desc: 'Akt chrztu sporządzony po łacinie, rodzicami chrzestnymi byli prof. Kazimierz Bartel i Jadwiga Dzieduszycka.' },
      { year: '1936', title: 'Dyplom Politechniki Lwowskiej', place: 'Lwów', desc: 'Tytuł inżyniera dróg i mostów z wpisem do Złotej Księgi Absolwentów.' },
      { year: '1938', title: 'Ślub z Zofią Zamoyską w Katedrze Lwowskiej', place: 'Lwów', desc: 'Uroczystość udokumentowana fotografią z zakładu fotograficznego przy Pasażu Mikolascha.' },
      { year: '1945', title: 'Ekspatriacja ze Lwowa do Krakowa', place: 'Lwów → Kraków', desc: 'Podróż wagonem towarowym nr 4418 z kartą ewakuacyjną Państwowego Urzędu Repatriacyjnego.' },
      { year: '1989', title: 'Odejście w Krakowie', place: 'Kraków', desc: 'Spoczął na Cmentarzu Rakowickim.' }
    ],
    residences: [
      { city: 'Lwów, ul. Akademicka 21', years: '1912–1945', x: 84, y: 82, note: 'Rodzinna kamienica we Lwowie' },
      { city: 'Stanisławów (delegacja kolejowa)', years: '1937–1939', x: 87, y: 90, note: 'Nadzór nad budową mostu kolejowego nad Bystrzycą' },
      { city: 'Kraków, ul. Krupnicza', years: '1945–1989', x: 53, y: 77, note: 'Dom powojenny w Krakowie' }
    ]
  },
  {
    id: 'anc-5',
    firstName: 'Zofia',
    lastName: 'Korzeniowska',
    maidenName: 'Zamoyska',
    generation: 3,
    generationLabel: 'Pokolenie III (Dziadkowie)',
    role: 'Babcia (linia ojczysta)',
    birthDate: '12 maja 1916',
    birthYear: 1916,
    deathDate: '29 listopada 2004',
    deathYear: 2004,
    birthPlace: 'Krzemieniec',
    region: 'Wołyń / Galicja',
    coordinates: { x: 92, y: 76, city: 'Krzemieniec', period: '1916–1934' },
    profession: 'Pianistka, absolwentka Konserwatorium Polskiego Towarzystwa Muzycznego we Lwowie',
    coatOfArms: 'Jelita',
    portraitSeed: 'zofia-1916',
    portraitTone: '#9E7836',
    parentIds: [],
    spouseId: 'anc-4',
    siblingIds: [],
    childrenIds: ['anc-2'],
    isVerified: true,
    verificationSource: 'Akt małżeństwa Archikatedry Lwowskiej 1938, tom IV, str. 88',
    shortBio: 'Wychowanka słynnego Liceum Krzemienieckiego i Konserwatorium we Lwowie. Autorka pamiętnika obejmującego lata 1934–1946.',
    storyParagraphs: [
      'Zofia przyszła na świat w malowniczym Krzemieńcu na Wołyniu, w cieniu Góry Królowej Bony. Jej ojciec był wykładowcą w reaktywowanym przez Tadeusza Czackiego i II RP Liceum Krzemienieckim.',
      'W 1934 roku wyjechała do Lwowa, by kształcić się w klasie fortepianu. Przez całą wojnę prowadziła oprawiony w zielone płótno dziennik, który dziś stanowi jeden z najcenniejszych rękopisów w Cyfrowym Archiwum Rodzinnym.'
    ],
    lifeEvents: [
      { year: '1916', title: 'Narodziny w Krzemieńcu', place: 'Krzemieniec', desc: 'Ochrzczona w kościele licealnym św. Ignacego Loyoli i Stanisława Kostki.' },
      { year: '1934', title: 'Matura w Liceum Krzemienieckim', place: 'Krzemieniec', desc: 'Świadectwo dojrzałości z podpisem kuratora okręgu szkolnego.' },
      { year: '1938', title: 'Ślub z inż. Tadeuszem Korzeniowskim', place: 'Lwów', desc: 'Małżeństwo zawarte w Katedrze Łacińskiej we Lwowie.' }
    ],
    residences: [
      { city: 'Krzemieniec, ul. Szeroka', years: '1916–1934', x: 92, y: 76, note: 'Rodzinny dworek w Krzemieńcu' },
      { city: 'Lwów', years: '1934–1945', x: 84, y: 82, note: 'Studia muzyczne i życie małżeńskie' },
      { city: 'Kraków', years: '1945–2004', x: 53, y: 77, note: 'Praca pedagogiczna w Szkole Muzycznej' }
    ]
  },
  {
    id: 'anc-6',
    firstName: 'Stanisław',
    lastName: 'Wielowiejski',
    maidenName: null,
    generation: 3,
    generationLabel: 'Pokolenie III (Dziadkowie)',
    role: 'Dziadek (linia macierzysta)',
    birthDate: '7 kwietnia 1910',
    birthYear: 1910,
    deathDate: '15 lutego 1984',
    deathYear: 1984,
    birthPlace: 'Wilno',
    region: 'Wileńszczyzna',
    coordinates: { x: 88, y: 22, city: 'Wilno', period: '1910–1946' },
    profession: 'Adwokat, wykładowca Uniwersytetu Stefana Batorego w Wilnie',
    coatOfArms: 'Półkozic',
    portraitSeed: 'stanislaw-1910',
    portraitTone: '#2A4E3E',
    parentIds: [],
    spouseId: 'anc-7',
    siblingIds: [],
    childrenIds: ['anc-3'],
    isVerified: true,
    verificationSource: 'Litewskie Państwowe Archiwum Historyczne w Wilnie (LVIA, fond 604)',
    shortBio: 'Prawnik wykształcony na Uniwersytecie Stefana Batorego w Wilnie. Po 1946 roku współtworzył palestrę adwokacką na Wybrzeżu.',
    storyParagraphs: [
      'Stanisław Wielowiejski urodził się w 1910 roku przy ulicy Świętojańskiej w Wilnie, tuż obok murów Uniwersytetu Stefana Batorego, z którym związał swoją młodość akademicką. W litewskim archiwum LVIA nasi genealogowie odnaleźli kompletną teczkę studencką Stanisława z 1929 roku wraz z fotografią indeksową.',
      'W 1946 roku, w ramach ekspatriacji wileńskiej inteligencji, osiadł z żoną Heleną w Gdańsku-Oliwie.'
    ],
    lifeEvents: [
      { year: '1910', title: 'Narodziny w Wilnie', place: 'Wilno', desc: 'Chrzest w kościele św. Janów w Wilnie.' },
      { year: '1933', title: 'Magisterium prawa na USB w Wilnie', place: 'Wilno', desc: 'Dyplom podpisany przez rektora Uniwersytetu Stefana Batorego.' },
      { year: '1946', title: 'Przyjazd do Gdańska-Oliwy', place: 'Wilno → Gdańsk', desc: 'Otwarcie kancelarii prawnej we Wrzeszczu.' }
    ],
    residences: [
      { city: 'Wilno, ul. Świętojańska 8', years: '1910–1946', x: 88, y: 22, note: 'Kamienica w historycznym centrum Wilna' },
      { city: 'Gdańsk-Oliwa, ul. Polanki', years: '1946–1984', x: 48, y: 18, note: 'Dom rodzinny na Pomorzu' }
    ]
  },
  {
    id: 'anc-7',
    firstName: 'Helena',
    lastName: 'Wielowiejska',
    maidenName: 'Balińska',
    generation: 3,
    generationLabel: 'Pokolenie III (Dziadkowie)',
    role: 'Babcia (linia macierzysta)',
    birthDate: '2 sierpnia 1915',
    birthYear: 1915,
    deathDate: '19 czerwca 1998',
    deathYear: 1998,
    birthPlace: 'Wilno (Jaszuny)',
    region: 'Wileńszczyzna',
    coordinates: { x: 90, y: 26, city: 'Jaszuny k. Wilna', period: '1915–1945' },
    profession: 'Botaniczka, ilustratorka zielników naukowych',
    coatOfArms: 'Jastrzębiec',
    portraitSeed: 'helena-1915',
    portraitTone: '#866735',
    parentIds: [],
    spouseId: 'anc-6',
    siblingIds: [],
    childrenIds: ['anc-3'],
    isVerified: true,
    verificationSource: 'Księgi parafialne w Turgielach i Wilnie (LVIA Wilno)',
    shortBio: 'Pochodziła z okolic Jaszun pod Wilnem, słynących z tradycji romantycznych Śniadeckich i Balińskich. Tworzyła akwarelowe atlasy roślin.',
    storyParagraphs: [
      'Helena z Balińskich wychowała się w majątku pod Jaszunami, gdzie od dziecka szkicowała rośliny Puszczy Rudnickiej. Jej zielniki z lat 30. XX wieku, przemycone w 1946 roku w kufrze podróżnym do Gdańska, zachwycają precyzją rysunku i kaligraficznymi opisami po łacinie.'
    ],
    lifeEvents: [
      { year: '1915', title: 'Narodziny pod Wilnem', place: 'Jaszuny / Wilno', desc: 'Przychodzi na świat w ziemiańskiej rodzinie Balińskich.' },
      { year: '1937', title: 'Ślub ze Stanisławem Wielowiejskim', place: 'Wilno, Kościół św. Anny', desc: 'Ceremonia w perle wileńskiego gotyku.' }
    ],
    residences: [
      { city: 'Jaszuny k. Wilna', years: '1915–1935', x: 90, y: 26, note: 'Rodzinny dwór nad Mereczanką' },
      { city: 'Wilno', years: '1935–1946', x: 88, y: 22, note: 'Mieszkanie przy ul. Świętojańskiej' },
      { city: 'Gdańsk-Oliwa', years: '1946–1998', x: 48, y: 18, note: 'Ogród botaniczny i dom w Oliwie' }
    ]
  },
  {
    id: 'anc-8',
    firstName: 'Ignacy',
    lastName: 'Korzeniowski',
    maidenName: null,
    generation: 4,
    generationLabel: 'Pokolenie IV (Pradziadkowie)',
    role: 'Pradziadek (nestor rodu)',
    birthDate: '3 lutego 1874',
    birthYear: 1874,
    deathDate: '11 listopada 1934',
    deathYear: 1934,
    birthPlace: 'Złoczów / Lwów',
    region: 'Królestwo Galicji i Lodomerii',
    coordinates: { x: 88, y: 81, city: 'Złoczów / Lwów', period: '1874–1934' },
    profession: 'Radca Dworu, Sędzia Sądu Apelacyjnego we Lwowie',
    coatOfArms: 'Nałęcz',
    portraitSeed: 'ignacy-1874',
    portraitTone: '#5A4322',
    parentIds: [],
    spouseId: null,
    siblingIds: [],
    childrenIds: ['anc-4'],
    isVerified: true,
    verificationSource: 'Centralne Państwowe Archiwum Historyczne Ukrainy we Lwowie (CDIAU, fond 146) + Nominacja z 1923 r.',
    shortBio: 'Doktor praw Uniwersytetu Jana Kazimierza we Lwowie, sędzia apelacyjny II RP. Bohater najnowszego odkrycia archiwalnego z 1923 roku.',
    storyParagraphs: [
      'Ignacy Korzeniowski urodził się 3 lutego 1874 roku w Złoczowie jako syn powstańca styczniowego z 1863 roku. Po ukończeniu C.K. Gimnazjum im. Franciszka Józefa we Lwowie odbył studia prawnicze na Uniwersytecie Lwowskim, uzyskując stopień doktora obojga praw (Doctor Iuris Utriusque) w 1899 roku.',
      'W odrodzonej Polsce w 1923 roku został mianowany przez Prezydenta RP Stanisława Wojciechowskiego Sędzią Sądu Apelacyjnego we Lwowie. Oryginał tego dekretu nominacyjnego z pieczęcią tłoczoną Rzeczypospolitej został odnaleziony przez naszych genealogów w ubiegłym tygodniu w zespole akt Ministerstwa Sprawiedliwości.'
    ],
    lifeEvents: [
      { year: '1874', title: 'Narodziny w Złoczowie', place: 'Złoczów', desc: 'Wpis w księdze chrztów parafii Wniebowzięcia NMP w Złoczowie (t. IX, k. 44).' },
      { year: '1899', title: 'Doktorat obojga praw we Lwowie', place: 'Lwów', desc: 'Promocja doktorska na Uniwersytecie Lwowskim.' },
      { year: '1923', title: 'Dekret nominacyjny Sędziego Sądu Apelacyjnego', place: 'Warszawa / Lwów', desc: 'Nowo odnaleziony dokument z 14 października 1923 r. z podpisem Ministra Sprawiedliwości.' },
      { year: '1934', title: 'Uroczysty pogrzeb na Cmentarzu Łyczakowskim', place: 'Lwów', desc: 'Pochowany w kaplicy rodowej na Polu 19 Cmentarza Łyczakowskiego.' }
    ],
    residences: [
      { city: 'Złoczów (majątek podmiejski)', years: '1874–1892', x: 88, y: 81, note: 'Rodzinny dwór modrzewiowy pod Złoczowem' },
      { city: 'Wiedeń (praktyka sądowa)', years: '1899–1902', x: 42, y: 94, note: 'Staż w Najwyższym Trybunale Kasacyjnym w Wiedniu' },
      { city: 'Lwów, ul. Akademicka 21', years: '1902–1934', x: 84, y: 82, note: 'Reprezentacyjna kamienica sędziego Ignacego Korzeniowskiego' }
    ]
  }
];

// Dane dla trybu "TWOJE PRAWDZIWE BADANIA W TOKU" (aby wyraźnie odróżnić od danych demonstracyjnych)
export const LIVE_CLIENT_ANCESTORS = [
  {
    id: 'live-1',
    firstName: 'Janusz',
    lastName: 'Korzeniowski (Konto Klienta)',
    maidenName: null,
    generation: 1,
    generationLabel: 'Pokolenie I (Właściciel Konta)',
    role: 'Zleceniodawca badań',
    birthDate: '14 maja 1978',
    birthYear: 1978,
    deathDate: 'żyje',
    deathYear: null,
    birthPlace: 'Kraków',
    region: 'Małopolska',
    coordinates: { x: 54, y: 78, city: 'Kraków', period: '1978 – obecnie' },
    profession: 'Architekt',
    coatOfArms: 'W trakcie weryfikacji heraldycznej',
    portraitSeed: 'live-janusz',
    portraitTone: '#244638',
    parentIds: ['live-2', 'live-3'],
    spouseId: null,
    siblingIds: [],
    childrenIds: [],
    isVerified: true,
    verificationSource: 'Dane przekazane przez Klienta w ankiecie startowej',
    shortBio: 'Aktywne zlecenie badawcze nr TK/2026/114 (Pakiet Kompleksowy). Trwa kwerenda w Archiwum Narodowym w Krakowie oraz AGAD w Warszawie.',
    storyParagraphs: [
      'To widok Twojego rzeczywistego zlecenia badawczego. Wszystkie rekordy oznaczone pieczęcią „Zweryfikowano w Archiwum” zostały już potwierdzone oryginalnymi wypisami metrykalnymi przez zespół TwojeKorzenie.',
      'Możesz w każdej chwili przełączyć się na pełny Tryb Demonstracyjny w górnym pasku, aby zobaczyć docelowy wygląd ukończonego, 4-pokoleniowego archiwum po zakończeniu wszystkich etapów prac.'
    ],
    lifeEvents: [
      { year: '2026-09', title: 'Rozpoczęcie kwerendy archiwalnej', place: 'Kraków / Warszawa', desc: 'Podpisanie umowy i przekazanie dokumentów wyjściowych.' },
      { year: '2026-11', title: 'Zakończenie Etapu III (Archiwa Kresowe AGAD)', place: 'Warszawa', desc: 'Potwierdzenie aktów z lat 1912–1923.' }
    ],
    residences: [
      { city: 'Kraków', years: '1978–obecnie', x: 54, y: 78, note: 'Siedziba główna rodziny' }
    ]
  },
  {
    id: 'live-2',
    firstName: 'Adam',
    lastName: 'Korzeniowski',
    maidenName: null,
    generation: 2,
    generationLabel: 'Pokolenie II (Rodzice)',
    role: 'Ojciec (Zweryfikowany)',
    birthDate: '9 września 1947',
    birthYear: 1947,
    deathDate: '18 stycznia 2021',
    deathYear: 2021,
    birthPlace: 'Kraków',
    region: 'Małopolska',
    coordinates: { x: 54, y: 78, city: 'Kraków', period: '1947–2021' },
    profession: 'Profesor UJ',
    coatOfArms: 'Nałęcz (potwierdzony)',
    portraitSeed: 'live-adam',
    portraitTone: '#2E5947',
    parentIds: ['live-4'],
    spouseId: 'live-3',
    siblingIds: [],
    childrenIds: ['live-1'],
    isVerified: true,
    verificationSource: 'Potwierdzono: Archiwum Kurii Metropolitalnej w Krakowie',
    shortBio: 'Rekord w pełni zweryfikowany podczas I etapu badań.',
    storyParagraphs: [
      'Akt chrztu oraz karty meldunkowe z lat 1947–1955 zostały pozyskane i dołączone do Twojego archiwum.'
    ],
    lifeEvents: [
      { year: '1947', title: 'Narodziny w Krakowie', place: 'Kraków', desc: 'Potwierdzone odpisem z księgi parafialnej.' }
    ],
    residences: [
      { city: 'Kraków', years: '1947–2021', x: 54, y: 78, note: 'Potwierdzony adres w księgach meldunkowych' }
    ]
  },
  {
    id: 'live-3',
    firstName: 'Maria',
    lastName: 'Korzeniowska',
    maidenName: 'Wielowiejska',
    generation: 2,
    generationLabel: 'Pokolenie II (Rodzice)',
    role: 'Matka (W trakcie digitalizacji)',
    birthDate: '24 marca 1950',
    birthYear: 1950,
    deathDate: 'żyje',
    deathYear: null,
    birthPlace: 'Gdańsk',
    region: 'Pomorze',
    coordinates: { x: 48, y: 18, city: 'Gdańsk', period: '1950–1969' },
    profession: 'Konserwatorka zabytków',
    coatOfArms: 'Półkozic',
    portraitSeed: 'live-maria',
    portraitTone: '#8C6B37',
    parentIds: [],
    spouseId: 'live-2',
    siblingIds: [],
    childrenIds: ['live-1'],
    isVerified: true,
    verificationSource: 'Potwierdzono: Archiwum Państwowe w Gdańsku',
    shortBio: 'Trwa kwerenda uzupełniająca dotycząca przodków z linii wileńskiej w Litewskim Państwowym Archiwum Historycznym (LVIA).',
    storyParagraphs: [
      'Zespół naszych paleografów oczekuje obecnie na skany z Wilna z lat 1910–1939.'
    ],
    lifeEvents: [
      { year: '1950', title: 'Narodziny w Gdańsku', place: 'Gdańsk', desc: 'Akt urodzenia zweryfikowany.' }
    ],
    residences: [
      { city: 'Gdańsk-Oliwa', years: '1950–1969', x: 48, y: 18, note: 'Archiwum Państwowe w Gdańsku' }
    ]
  },
  {
    id: 'live-4',
    firstName: 'Ignacy',
    lastName: 'Korzeniowski',
    maidenName: null,
    generation: 4,
    generationLabel: 'Pokolenie IV (Pradziadkowie)',
    role: 'Pradziadek (Nowe odkrycie!)',
    birthDate: '3 lutego 1874',
    birthYear: 1874,
    deathDate: '11 listopada 1934',
    deathYear: 1934,
    birthPlace: 'Złoczów / Lwów',
    region: 'Galicja',
    coordinates: { x: 84, y: 82, city: 'Lwów', period: '1874–1934' },
    profession: 'Sędzia Sądu Apelacyjnego we Lwowie',
    coatOfArms: 'Nałęcz',
    portraitSeed: 'live-ignacy',
    portraitTone: '#5A4322',
    parentIds: [],
    spouseId: null,
    siblingIds: [],
    childrenIds: ['live-2'],
    isVerified: true,
    verificationSource: 'NOWE ODKRYCIE: Akt nominacyjny z 14.10.1923 r. (AAN Warszawa)',
    shortBio: 'W ubiegłym tygodniu nasz genealog odnalazł oryginalny dekret nominacyjny pradziadka Ignacego z 1923 roku.',
    storyParagraphs: [
      'Przełomowe odkrycie w Archiwum Akt Nowych w Warszawie potwierdziło przebieg służby sędziowskiej pradziadka Ignacego we Lwowie.'
    ],
    lifeEvents: [
      { year: '1923', title: 'Nominacja sędziowska we Lwowie', place: 'Lwów', desc: 'Odnaleziony dokument z 1923 roku.' }
    ],
    residences: [
      { city: 'Lwów, ul. Akademicka 21', years: '1902–1934', x: 84, y: 82, note: 'Potwierdzono w Księdze Adresowej Lwowa z 1923 r.' }
    ]
  }
];

// 7 wymaganych kategorii dokumentów w Cyfrowym Archiwum Rodzinnym
export const ARCHIVE_CATEGORIES = [
  'Wszystkie',
  'Akty urodzenia',
  'Akty małżeństwa',
  'Akty zgonu',
  'Stare fotografie',
  'Dokumenty historyczne',
  'Listy i wspomnienia',
  'Mapy i materiały archiwalne'
];

export const ARCHIVE_DOCUMENTS = [
  {
    id: 'doc-1923-nominacja',
    title: 'Dekret Nominacyjny Sędziego Sądu Apelacyjnego we Lwowie',
    category: 'Dokumenty historyczne',
    date: '14 października 1923 r.',
    year: 1923,
    place: 'Warszawa / Lwów',
    ancestorId: 'anc-8',
    ancestorName: 'Ignacy Korzeniowski (Pradziadek)',
    archiveSource: 'Archiwum Akt Nowych w Warszawie, Zespół Min. Sprawiedliwości, sygn. II/1923/408',
    language: 'Język polski (urzędowy II RP)',
    isNewDiscovery: true,
    description: 'Oryginalny akt mianowania dr. Ignacego Korzeniowskiego na stanowisko Sędziego Sądu Apelacyjnego we Lwowie, opatrzony suchą pieczęcią Rzeczypospolitej Polskiej oraz podpisem Ministra Sprawiedliwości.',
    transcription: '„W IMIENIU RZECZYPOSPOLITEJ POLSKIEJ — Mianuję Pana Doktora Praw Ignacego Korzeniowskiego, dotychczasowego radcę sądu okręgowego, Sędzią Sądu Apelacyjnego we Lwowie z dniem 1 listopada 1923 roku. Dan w Warszawie, dnia 14 października 1923 r.”',
    stampText: 'MINISTERSTWO SPRAWIEDLIWOŚCI R.P. • 1923 • LWÓW',
    paperTone: '#EDE3CE'
  },
  {
    id: 'doc-1912-urodzenie',
    title: 'Świadectwo Chrztu i Urodzenia Tadeusza Korzeniowskiego',
    category: 'Akty urodzenia',
    date: '28 listopada 1912 r.',
    year: 1912,
    place: 'Lwów, Parafia św. Elżbiety',
    ancestorId: 'anc-4',
    ancestorName: 'Tadeusz Korzeniowski (Dziadek)',
    archiveSource: 'Archiwum Główne Akt Dawnych w Warszawie (Księgi Zabużańskie, Lwów św. Elżbieta, t. XXIV, str. 119)',
    language: 'Łacina (tłumaczenie przysięgłe w załączeniu)',
    isNewDiscovery: false,
    description: 'Wypis z księgi ochrzczonych (Liber Natorum) potwierdzający narodziny Tadeusza Korzeniowskiego dnia 19 listopada 1912 r. przy ulicy Akademickiej 21 we Lwowie.',
    transcription: '„Anno Domini 1912, die 19 Novembris natus, et die 28 Novembris baptizatus est Thaddaeus Josephus binom. Korzeniowski, filius legitimus Ignatii Korzeniowski, Iuris Utriusque Doctoris, et Mariae de domo Dunin-Borkowska...”',
    stampText: 'ECCLESIA PAROCHIALIS S. ELISABETHAE LEOPOLI • 1912',
    paperTone: '#E8DEC8'
  },
  {
    id: 'doc-1938-malzenstwo',
    title: 'Akt Małżeństwa Tadeusza Korzeniowskiego i Zofii Zamoyskiej',
    category: 'Akty małżeństwa',
    date: '18 czerwca 1938 r.',
    year: 1938,
    place: 'Lwów, Archikatedra Łacińska',
    ancestorId: 'anc-4',
    ancestorName: 'Tadeusz Korzeniowski & Zofia Zamoyska',
    archiveSource: 'Księgi Metrykalne Archikatedry Lwowskiej (Liber Copulatorum 1938, poz. 142)',
    language: 'Łacina / Język polski',
    isNewDiscovery: false,
    description: 'Uroczysty akt zaślubin zawarty w Bazylice Archikatedralnej Wniebowzięcia NMP we Lwowie. Zawiera podpisy nowożeńców oraz świadków.',
    transcription: '„Dnia 18 czerwca 1938 roku we Lwowie zawarli związek małżeński: Pan Inż. Tadeusz Korzeniowski, kawaler lat 25, zamieszkały we Lwowie przy ul. Akademickiej 21, oraz Panna Zofia Zamoyska, lat 22, urodzona w Krzemieńcu...”',
    stampText: 'BASILICA METROPOLITANA LEOPOLIENSIS • 1938',
    paperTone: '#F0E7D5'
  },
  {
    id: 'doc-1934-zgon',
    title: 'Akt Zgonu i Karta Cmentarna dr. Ignacego Korzeniowskiego',
    category: 'Akty zgonu',
    date: '11 listopada 1934 r.',
    year: 1934,
    place: 'Lwów, Cmentarz Łyczakowski',
    ancestorId: 'anc-8',
    ancestorName: 'Ignacy Korzeniowski (Pradziadek)',
    archiveSource: 'Księgi Zmarłych Parafii św. Mikołaja we Lwowie + Rejestr Cmentarza Łyczakowskiego (Pole 19, grób 84)',
    language: 'Język polski / Łacina',
    isNewDiscovery: false,
    description: 'Dokument potwierdzający datę śmierci sędziego Ignacego Korzeniowskiego oraz dokładną lokalizację kaplicy grobowej na Cmentarzu Łyczakowskim we Lwowie.',
    transcription: '„Dnia 11 listopada 1934 r. opatrzony Świętymi Sakramentami zmarł we Lwowie Ś.P. Dr Ignacy Korzeniowski, emerytowany Sędzia Sądu Apelacyjnego, przeżywszy lat 60. Pochowany na Cmentarzu Łyczakowskim w Polu 19.”',
    stampText: 'ZARZĄD CMENTARZA ŁYCZAKOWSKIEGO WE LWOWIE • 1934',
    paperTone: '#E5DAC2'
  },
  {
    id: 'doc-1928-fotografia',
    title: 'Portret Rodzinny z Atelier Fotograficznego „H. Trzemeski” we Lwowie',
    category: 'Stare fotografie',
    date: 'Maj 1928 r.',
    year: 1928,
    place: 'Lwów, ul. 3 Maja 7 (Atelier Trzemeski)',
    ancestorId: 'anc-4',
    ancestorName: 'Ignacy i Tadeusz Korzeniowscy',
    archiveSource: 'Domowe Archiwum Rodziny Korzeniowskich (Digitalizacja 1200 DPI, sygn. FOTO-014)',
    language: 'Odręczna dedykacja na rewersie w jęz. polskim',
    isNewDiscovery: false,
    description: 'Fotografia gabinetowa na oryginalnym kartoniku z tłoczonym złotym logo fotografa Huberta Trzemeskiego. Przedstawia sędziego Ignacego z 16-letnim synem Tadeuszem w mundurku gimnazjalnym.',
    transcription: 'Napis piórem na odwrocie: „Na pamiątkę promocji Tadeusza do VII klasy gimnazjalnej – Lwów, w maju 1928 roku. Ignacy Korzeniowski”.',
    stampText: 'ATELIER FOTOGRAFICZNE H. TRZEMESKI • LWÓW',
    paperTone: '#DFD2B8'
  },
  {
    id: 'doc-1944-pamietnik',
    title: 'Rękopis Wspomnień Zofii z Zamoyskich i List z Krzemieńca',
    category: 'Listy i wspomnienia',
    date: 'Wrzesień 1939 – Kwiecień 1945 r.',
    year: 1945,
    place: 'Krzemieniec / Lwów / Kraków',
    ancestorId: 'anc-5',
    ancestorName: 'Zofia Korzeniowska z d. Zamoyska (Babcia)',
    archiveSource: 'Zbiór Rękopisów Rodzinnych (Karta 24–29, pełna transkrypcja cyfrowa)',
    language: 'Język polski (rękopis atramentem)',
    isNewDiscovery: true,
    description: 'Poruszające zapiski prowadzone przez babcię Zofię w czasie pożegnania z rodzinnym Krzemieńcem oraz podczas podróży repatriacyjnej ze Lwowa do Krakowa wiosną 1945 roku.',
    transcription: '„12 kwietnia 1945 r. Pakujemy ostatnią skrzynię. Tadeusz owinął w płótno portret ojca i dyplom z Politechniki. Ja zabieram nuty Chopina z Konserwatorium i ten zeszyt, by nasz syn wiedział kiedyś, skąd przyszedł jego ród...”',
    stampText: 'ARCHIWUM DOMOWE • RĘKOPIS ZOFII KORZENIOWSKIEJ',
    paperTone: '#EFE6D4'
  },
  {
    id: 'doc-1889-mapa',
    title: 'Mapa Katastralna Królestwa Galicji – Majątek pod Złoczowem i Plan Lwowa',
    category: 'Mapy i materiały archiwalne',
    date: '1889 / rewizja 1921 r.',
    year: 1889,
    place: 'Lwów i powiat złoczowski',
    ancestorId: 'anc-8',
    ancestorName: 'Ignacy Korzeniowski (Pradziadek)',
    archiveSource: 'Centralne Państwowe Archiwum Historyczne we Lwowie (Archiwum Map Katastralnych, arkusz XIV)',
    language: 'Język polski i niemiecki (skala 1:2880)',
    isNewDiscovery: true,
    description: 'Kolorowany arkusz katastralny z zaznaczoną parcelą dworską nr 148 należącą do rodziny Korzeniowskich oraz planem sytuacyjnym kamienicy przy ul. Akademickiej we Lwowie.',
    transcription: 'Wypis z protokołu parcelowego: „Parcela budowlana L.p. 148 wraz z ogrodem owocowym i dworkiem modrzewiowym – własność hip. rodziny Korzeniowskich herbu Nałęcz”.',
    stampText: 'K.K. KATASTRAL-ARCHIV LEMBERG • ARKUSZ XIV',
    paperTone: '#E6DBC3'
  }
];

// Sekcja "Najnowsze odkrycia" z wymaganym powiadomieniem
export const RECENT_DISCOVERIES = [
  {
    id: 'disc-1',
    isHighlighted: true,
    dateLabel: 'Dzisiaj, 11:40',
    badge: 'Przełomowe Odkrycie',
    notificationText: 'Odnaleźliśmy dokument dotyczący Twojego pradziadka z 1923 roku',
    detailText: 'W zespole akt Ministerstwa Sprawiedliwości (AAN Warszawa) nasz genealog dr Marek Wolski odnalazł oryginalny dekret nominacyjny Ignacego Korzeniowskiego na Sędziego Sądu Apelacyjnego we Lwowie z dnia 14 października 1923 r.',
    linkedAncestorId: 'anc-8',
    linkedDocumentId: 'doc-1923-nominacja',
    genealogist: 'dr Marek Wolski, Główny Genealog'
  },
  {
    id: 'disc-2',
    isHighlighted: false,
    dateLabel: '3 dni temu',
    badge: 'Archiwum Wileńskie',
    notificationText: 'Potwierdzono wpis w księdze immatrykulacyjnej Uniwersytetu Stefana Batorego w Wilnie z 1929 r.',
    detailText: 'Otrzymaliśmy cyfrowe skany z Litewskiego Państwowego Archiwum Historycznego (LVIA) potwierdzające studia prawnicze dziadka Stanisława Wielowiejskiego.',
    linkedAncestorId: 'anc-6',
    linkedDocumentId: 'doc-1912-urodzenie',
    genealogist: 'mgr Anna Jagiellonka, Paleograf'
  },
  {
    id: 'disc-3',
    isHighlighted: false,
    dateLabel: 'Tydzień temu',
    badge: 'Kartografia Historyczna',
    notificationText: 'Zlokalizowano dokładną parcelę rodową na mapie katastralnej Galicji z 1889 roku',
    detailText: 'Na arkuszu katastralnym nr XIV odnaleźliśmy dokładny obrys dawnego dworku modrzewiowego oraz ogrodu należącego do pradziadka Ignacego pod Złoczowem.',
    linkedAncestorId: 'anc-8',
    linkedDocumentId: 'doc-1889-mapa',
    genealogist: 'dr Marek Wolski, Główny Genealog'
  }
];

// Oś czasu historii rodziny (wielopokoleniowa)
export const FAMILY_TIMELINE_EVENTS = [
  {
    id: 'tl-1874',
    year: '1874',
    era: 'Epoka Autonomii Galicyjskiej',
    title: 'Narodziny pradziadka Ignacego Korzeniowskiego w Złoczowie',
    location: 'Złoczów / Lwów',
    description: 'Przychodzi na świat przyszły doktor praw Uniwersytetu Lwowskiego i sędzia Sądu Apelacyjnego. Początek udokumentowanej metrykalnie linii lwowskiej.',
    ancestorId: 'anc-8',
    documentId: 'doc-1889-mapa',
    category: 'Narodziny'
  },
  {
    id: 'tl-1910',
    year: '1910–1912',
    era: 'Przeddzień Wielkiej Wojny',
    title: 'Narodziny dziadków: Stanisława w Wilnie i Tadeusza we Lwowie',
    location: 'Wilno & Lwów',
    description: 'W dwóch wielkich ośrodkach kultury polskiej na Kresach przychodzą na świat dziadkowie ze strony ojca i matki.',
    ancestorId: 'anc-4',
    documentId: 'doc-1912-urodzenie',
    category: 'Pokolenie Dziadków'
  },
  {
    id: 'tl-1923',
    year: '1923',
    era: 'II Rzeczpospolita',
    title: 'Nominacja sędziowska Ignacego Korzeniowskiego we Lwowie',
    location: 'Warszawa / Lwów',
    description: 'Dnia 14 października 1923 roku pradziadek Ignacy odbiera dekret nominacyjny na Sędziego Sądu Apelacyjnego w odrodzonej Rzeczypospolitej.',
    ancestorId: 'anc-8',
    documentId: 'doc-1923-nominacja',
    category: 'Odkrycie 1923'
  },
  {
    id: 'tl-1938',
    year: '1938',
    era: 'Złote lata przedwojennego Lwowa',
    title: 'Ślub Tadeusza Korzeniowskiego i Zofii Zamoyskiej w Katedrze Lwowskiej',
    location: 'Lwów, Archikatedra Łacińska',
    description: 'Inżynier dróg i mostów Tadeusz Korzeniowski poślubia absolwentkę Liceum Krzemienieckiego i Konserwatorium Lwowskiego Zofię Zamoyską.',
    ancestorId: 'anc-4',
    documentId: 'doc-1938-malzenstwo',
    category: 'Małżeństwo'
  },
  {
    id: 'tl-1945',
    year: '1945–1946',
    era: 'Wielka Powojenna Wędrówka Rodów',
    title: 'Ekspatriacja ze Lwowa do Krakowa oraz z Wilna do Gdańska',
    location: 'Lwów → Kraków | Wilno → Gdańsk',
    description: 'Obie gałęzie rodziny opuszczają Kresy Wschodnie, ratując najcenniejsze dokumenty, fotografie i pamiętniki rodzinne.',
    ancestorId: 'anc-5',
    documentId: 'doc-1944-pamietnik',
    category: 'Migracja'
  },
  {
    id: 'tl-1974',
    year: '1974',
    era: 'Połączenie Linii Lwowskiej i Wileńskiej',
    title: 'Ślub prof. Adama Korzeniowskiego i Marii Wielowiejskiej w Krakowie',
    location: 'Kraków, Bazylika Mariacka',
    description: 'Spotkanie potomków lwowskich prawników i wileńskich adwokatów w Krakowie daje początek współczesnemu pokoleniu rodziny.',
    ancestorId: 'anc-2',
    documentId: 'doc-1928-fotografia',
    category: 'Małżeństwo'
  },
  {
    id: 'tl-2026',
    year: '2026',
    era: 'Cyfrowe Dziedzictwo TwojeKorzenie',
    title: 'Utworzenie Prywatnego Archiwum Rodu i Odkrycie Akt z 1923 r.',
    location: 'Kraków / Archiwum Cyfrowe',
    description: 'Zespół TwojeKorzenie kończy kwerendę archiwalną i oddaje w ręce rodziny interaktywne drzewo genealogiczne oraz zdigitalizowany skarbiec dokumentów.',
    ancestorId: 'anc-1',
    documentId: 'doc-1923-nominacja',
    category: 'Współczesność'
  }
];

// Dane rejestrowe i prawne firmy (Zadanie 16 z listy prawnej: Business details)
export const COMPANY_LEGAL_DETAILS = {
  companyName: 'TwojeKorzenie Sp. z o.o.',
  brandName: 'Dom Badań Genealogicznych TwojeKorzenie',
  street: 'ul. Kanonicza 14',
  postalCode: '31-002',
  city: 'Kraków',
  country: 'Polska',
  krs: '0000948210',
  registryCourt: 'Sąd Rejonowy dla Krakowa-Śródmieścia w Krakowie, XI Wydział Gospodarczy KRS',
  nip: '676-259-41-08',
  regon: '389104522',
  shareCapital: '150 000,00 zł (opłacony w całości)',
  email: 'kancelaria@twojekorzenie.pl',
  dpoEmail: 'iod@twojekorzenie.pl',
  securityEmail: 'security@twojekorzenie.pl',
  phone: '+48 12 418 90 20',
  officeHours: 'Poniedziałek – Piątek, godz. 9:00–18:00',
  bankAccount: 'PL 44 1140 2004 0000 3102 8192 4401'
};

// Zweryfikowane relacje klientów zgodne z Dyrektywą Omnibus (Zadanie 11: No fake reviews)
export const VERIFIED_CLIENT_REVIEWS = [
  {
    id: 'rev-1',
    clientName: 'prof. dr hab. Andrzej Lubomirski-Karski',
    city: 'Warszawa',
    serviceName: 'Pakiet kompleksowy – pełna podróż przez historię rodziny',
    orderRef: 'ZAM/2026/02/041',
    date: '14 maja 2026 r.',
    verificationMethod: 'Zweryfikowano na podstawie protokołu odbioru Księgi Rodu i opłaconej faktury FV/2026/05/019',
    quote: 'Zespół dr. Marka Wolskiego odnalazł w archiwach lwowskich i wiedeńskich metryki z lat 1818–1894, o których istnieniu nasza rodzina nie miała pojęcia. Każdy fakt w Księdze Rodu posiada dokładną sygnaturę archiwalną i skan oryginału.'
  },
  {
    id: 'rev-2',
    clientName: 'mec. Katarzyna Zaleska-Nowicka',
    city: 'Poznań',
    serviceName: 'Drzewo genealogiczne + Cyfrowe Archiwum Rodzinne',
    orderRef: 'ZAM/2026/04/089',
    date: '28 sierpnia 2026 r.',
    verificationMethod: 'Zweryfikowano na podstawie zrealizowanego zamówienia nr ZAM/2026/04/089 (zgoda pisemna klienta)',
    quote: 'Przed podpisaniem umowy otrzymałam bezpłatny raport wstępny, w którym uczciwie wskazano, które parafie z Wielkopolski zachowały księgi, a które spłonęły w 1945 r. Zero pustych obietnic, pełen profesjonalizm i przejrzyste rozliczenie.'
  },
  {
    id: 'rev-3',
    clientName: 'dr inż. Marek Sieniawski',
    city: 'Gdańsk',
    serviceName: 'Historia rodzinna – dokumentacja losów przodków',
    orderRef: 'ZAM/2026/06/152',
    date: '3 października 2026 r.',
    verificationMethod: 'Zweryfikowano na podstawie autoryzowanego konta w Panelu Klienta i faktury FV/2026/10/004',
    quote: 'Interaktywne drzewo 2D oraz zdigitalizowane pamiętniki mojego dziadka z Wilna stały się najważniejszą pamiątką dla moich dzieci i wnuków. Doceniam również najwyższy standard ochrony danych osobowych i pełną poufność.'
  }
];

// Początkowy stan konta klienta, zamówień, etapów realizacji i faktur
export const INITIAL_CLIENT_ACCOUNT = {
  id: 'usr-korzeniowski-01',
  firstName: 'Janusz',
  lastName: 'Korzeniowski',
  email: 'janusz.korzeniowski@twojekorzenie.pl',
  phone: '+48 604 812 390',
  city: 'Kraków, ul. Salwatorska 18',
  memberSince: 'Wrzesień 2026',
  role: 'client',
  ageVerified: true,
  passwordHash: 'pbkdf2_sha256$100000$a8f392c1b04e71d9$7f9d4c2a8b1e6f034c91e2a7d5b8f3019e4a2c6d8b0f1e3a5c7d9f2b4e6a8c01',
  consents: {
    termsAccepted: true,
    privacyAccepted: true,
    ageConfirmed: true,
    newsletterSubscribed: false,
    researchAlertsSubscribed: true,
    updatedAt: '16.11.2026'
  },
  activePackageId: 'pakiet-kompleksowy',
  activePackageName: 'Pakiet kompleksowy – pełna podróż przez historię rodziny',
  leadGenealogist: 'dr Marek Wolski (Archiwista & Historyk XIX/XX w.)',
  researchProgress: 86,
  researchStages: [
    { id: 'st-1', name: 'Wywiad rodzinny i audyt domowych pamiątek', status: 'completed', date: '18.09.2026' },
    { id: 'st-2', name: 'Kwerenda w USC oraz Archiwach Państwowych (Kraków, Gdańsk)', status: 'completed', date: '08.10.2026' },
    { id: 'st-3', name: 'Kwerenda kresowa: AGAD Warszawa, CDIAU Lwów, LVIA Wilno', status: 'completed', date: '12.11.2026' },
    { id: 'st-4', name: 'Opracowanie kart biograficznych i Księgi Historii Rodziny', status: 'in_progress', date: 'W toku (86%)' },
    { id: 'st-5', name: 'Druk muzealny Księgi Rodu i uroczyste przekazanie', status: 'upcoming', date: 'Planowany: Grudzień 2026' }
  ],
  orders: [
    {
      orderId: 'ZAM/2026/09/114',
      serviceId: 'pakiet-kompleksowy',
      serviceName: 'Pakiet kompleksowy – pełna podróż przez historię rodziny',
      orderDate: '15 września 2026',
      status: 'W realizacji – Etap IV z V (86%)',
      statusBadge: 'active',
      amount: '8 900,00 zł brutto',
      accessGranted: true
    },
    {
      orderId: 'ZAM/2026/10/209',
      serviceId: 'archiwum-rodzinne',
      serviceName: 'Digitalizacja i rekonstrukcja 45 fotografii lwowskich (1912–1939)',
      orderDate: '22 października 2026',
      status: 'Zrealizowane – Dokumenty w Archiwum',
      statusBadge: 'completed',
      amount: '1 900,00 zł brutto',
      accessGranted: true
    }
  ],
  invoices: [
    {
      invoiceId: 'FV/2026/09/088',
      date: '15.09.2026',
      description: 'Pakiet kompleksowy – I i II transza badań archiwalnych',
      amount: '6 000,00 zł brutto (w tym 23% VAT)',
      paymentMethod: 'Przelew bankowy Premium / Karta',
      status: 'Opłacona'
    },
    {
      invoiceId: 'FV/2026/10/142',
      date: '22.10.2026',
      description: 'Archiwum rodzinne – digitalizacja 1200 DPI i retusz konserwatorski',
      amount: '1 900,00 zł brutto (w tym 23% VAT)',
      paymentMethod: 'BLIK / Przelew natychmiastowy',
      status: 'Opłacona'
    },
    {
      invoiceId: 'FV/2026/11/301',
      date: '16.11.2026',
      description: 'Pakiet kompleksowy – III transza końcowa (Skład Księgi Rodu)',
      amount: '2 900,00 zł brutto (w tym 23% VAT)',
      paymentMethod: 'Do opłacenia po akceptacji składu',
      status: 'Oczekuje na płatność'
    }
  ]
};
