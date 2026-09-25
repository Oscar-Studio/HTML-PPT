export type CardType =
  | 'title'
  | 'text'
  | 'list'
  | 'image'
  | 'timeline'
  | 'resources'
  | 'divider';

export interface CardBase {
  id: string;
  type: CardType;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  zIndex: number;
  style?: CardStyle;
}

export interface CardStyle {
  color?: string;
  background?: string;
  fontSize?: number;
  fontWeight?: number | string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
}

export interface TitleCardData {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
}
export interface TextCardData {
  icon?: string;
  heading: string;
  body?: string;
}
export interface ListCardData {
  icon?: string;
  heading: string;
  items: string[];
}
export interface ImageCardData {
  src: string;
  alt?: string;
  fit?: 'contain' | 'cover' | 'fill';
  caption?: string;
}
export interface TimelineCardData {
  items: { icon?: string; title: string; body: string }[];
}
export interface ResourcesCardData {
  items: { icon?: string; title: string; desc?: string; href?: string }[];
}
export interface DividerCardData {
  text?: string;
  thickness?: number;
  color?: string;
}

export type CardData =
  | TitleCardData
  | TextCardData
  | ListCardData
  | ImageCardData
  | TimelineCardData
  | ResourcesCardData
  | DividerCardData;

export interface Card extends CardBase {
  data: CardData;
}

export interface SlideBackground {
  type: 'solid' | 'gradient';
  value: string;
}

export interface Slide {
  id: string;
  order: number;
  cards: Card[];
}

export interface Presentation {
  id: string;
  title: string;
  themeId: string;
  width: number;
  height: number;
  background: SlideBackground;
  slides: Slide[];
  createdAt: number;
  updatedAt: number;
  schemaVersion: number;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    muted: string;
  };
  fonts: {
    title: string;
    body: string;
  };
  cardDefaults: {
    borderRadius: number;
    padding: number;
    background: string;
    border: string;
  };
}

export interface ProjectMeta {
  id: string;
  title: string;
  updatedAt: number;
  slideCount: number;
  schemaVersion: number;
}