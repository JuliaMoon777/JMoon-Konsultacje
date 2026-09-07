export interface Review {
  id: string;
  author: string;
  rating: number;
  service: string;
  text: string;
  date: string;
}

export const MATRIX_REVIEWS: Review[] = [
  {
    id: 'rev-agnieszka-matrix-1',
    author: 'Agnieszka',
    rating: 5,
    service: 'EKSPRESOWA ANALIZA MATRYCY LOSU',
    text: `„Julio, dziękuję Ci za poświęcony czas i za odpowiedzi na moje pytania. Cieszę się, że mogłam chwilę z Tobą porozmawiać.

Imponuje mi Twoja intuicja i wiedza na temat liczb i wyczucie. Dziękuję za to, co robisz.

I dziękuję za dzisiejszy dzień. ☺️ Życzę Ci wszystkiego dobrego :)

PS. Twój sposób tłumaczenia bardzo do mnie trafia. Ciepły głos i prosty przekaz są super.”`,
    date: 'Zweryfikowana opinia',
  },
];
