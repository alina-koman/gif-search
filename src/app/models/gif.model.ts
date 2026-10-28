export interface GifRendition {
  url: string;
}

export interface GifUser {
  username: string;
  display_name: string;
  avatar_url: string;
  profile_url: string;
}

export interface Gif {
  id: string;
  title: string;
  url: string;
  embed_url: string;
  rating: string;
  import_datetime: string;
  images: {
    original: GifRendition;
    fixed_height: GifRendition;
  };
  user?: GifUser;
}

export interface GiphyPagination {
  total_count: number;
  count: number;
  offset: number;
}

export interface GiphyResponse {
  data: Gif[];
  pagination: GiphyPagination;
}
