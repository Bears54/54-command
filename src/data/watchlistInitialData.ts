import { WatchlistMediaItem } from '../types/binder';
import posterSciFiSeries from '../assets/images/poster_scifi_series_1794608563885.jpg';
import posterLuxuryDrama from '../assets/images/poster_luxury_drama_1794608564002.jpg';
import posterDesertEpic from '../assets/images/poster_desert_epic_1794608564064.jpg';
import posterEspionageThriller from '../assets/images/poster_espionage_thriller_1794608565023.jpg';

export function getDefaultPosterForMedia(
  type: WatchlistMediaItem['type'],
  genre: string = '',
  title: string = ''
): string | undefined {
  const haystack = `${type} ${genre} ${title}`.toLowerCase();
  if (haystack.includes('dune') || haystack.includes('epic') || haystack.includes('adventure')) {
    return posterDesertEpic;
  }
  if (haystack.includes('spy') || haystack.includes('thriller') || haystack.includes('horses') || haystack.includes('noir') || haystack.includes('crime')) {
    return posterEspionageThriller;
  }
  if (haystack.includes('sci-fi') || haystack.includes('severance') || haystack.includes('mystery') || haystack.includes('cyber')) {
    return posterSciFiSeries;
  }
  if (type === 'Movie') {
    return posterDesertEpic;
  }
  if (type === 'Series') {
    return posterLuxuryDrama;
  }
  return posterLuxuryDrama;
}

export const initialWatchlistMediaItems: WatchlistMediaItem[] = [
  {
    id: 'w-1',
    title: 'Severance (Season 2)',
    type: 'Series',
    platform: 'Apple TV+',
    status: 'In Progress',
    currentProgress: 6,
    totalProgress: 10,
    seasonsCount: 2,
    unit: 'episodes',
    rating: 5,
    genre: 'Sci-Fi / Thriller',
    notes: 'Mind-bending cinematography and impeccable pacing. Episode 6 cliffhanger!',
    imageSrc: posterSciFiSeries,
  },
  {
    id: 'w-2',
    title: 'The White Lotus (Season 3)',
    type: 'Series',
    platform: 'HBO Max',
    status: 'In Progress',
    currentProgress: 4,
    totalProgress: 8,
    seasonsCount: 3,
    unit: 'episodes',
    rating: 5,
    genre: 'Dark Comedy / Drama',
    notes: 'Set in Thailand luxury wellness resort. Incredible soundtrack and ensemble cast.',
    imageSrc: posterLuxuryDrama,
  },
  {
    id: 'w-3',
    title: 'Dune: Part Two',
    type: 'Movie',
    platform: 'HBO Max',
    status: 'Finished',
    currentProgress: 1,
    totalProgress: 1,
    unit: 'movie',
    rating: 5,
    genre: 'Sci-Fi Epic',
    notes: 'Masterpiece sound design and visual scale. 10/10 theatrical rewatch.',
    imageSrc: posterDesertEpic,
  },
  {
    id: 'w-4',
    title: 'Outlive: The Science & Art of Longevity',
    type: 'Book',
    platform: 'Hardcover',
    status: 'In Progress',
    currentProgress: 245,
    totalProgress: 496,
    unit: 'pages',
    rating: 5,
    genre: 'Health & Science',
    notes: 'Dr. Peter Attia on the four horsemen of chronic disease, zone 2 cardio & VO2 max.',
  },
  {
    id: 'w-5',
    title: 'Huberman Lab: Master Your Sleep & Sunlight',
    type: 'Podcast',
    platform: 'Spotify',
    status: 'Finished',
    currentProgress: 1,
    totalProgress: 1,
    unit: 'episodes',
    rating: 5,
    genre: 'Neuroscience',
    notes: 'Morning sunlight within 30 mins of waking sets circadian adenosine rhythms.',
  },
  {
    id: 'w-6',
    title: 'Slow Horses (Season 4)',
    type: 'Series',
    platform: 'Apple TV+',
    status: 'Want to Watch',
    currentProgress: 0,
    totalProgress: 6,
    seasonsCount: 4,
    unit: 'episodes',
    rating: 4,
    genre: 'British Spy Thriller',
    notes: 'Gary Oldman as Jackson Lamb. Highly recommended by brother.',
    imageSrc: posterEspionageThriller,
  },
];

