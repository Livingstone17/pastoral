export type EventType =
  | 'service'
  | 'wedding'
  | 'funeral'
  | 'hospital_visit'
  | 'counseling'
  | 'speaking'
  | 'meeting';

export type NoteType = 'sermon_prep' | 'personal' | 'counseling' | 'study';
export type MessageStatus = 'draft' | 'delivered' | 'archived';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  location?: string;
  startTime: string;
  endTime: string;
  recurrence?: 'weekly' | 'monthly';
  linkedContactId?: string;
  notes?: string;
  reminder?: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  type: NoteType;
  scriptureRefs: string[];
  linkedMessageId?: string;
  linkedContactId?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Message {
  id: string;
  title: string;
  dateDelivered?: string;
  seriesId?: string;
  scriptureRefs: string[];
  tags: string[];
  linkedEventId?: string;
  outline: string;
  status: MessageStatus;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  messageIds: string[];
}

export interface Contact {
  id: string;
  name: string;
  relationshipType: 'congregant' | 'colleague' | 'venue';
  phone?: string;
  email?: string;
  notes?: string;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  denomination: string;
  preferredTranslation: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  service: 'Service',
  wedding: 'Wedding',
  funeral: 'Funeral',
  hospital_visit: 'Hospital Visit',
  counseling: 'Counseling',
  speaking: 'Speaking',
  meeting: 'Meeting',
};

export const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; dot: string }> = {
  service: { bg: '#FEF3E2', text: '#8A5A0A', dot: '#D4922A' },
  wedding: { bg: '#FCE8F1', text: '#8A3060', dot: '#C06088' },
  funeral: { bg: '#EEEBE9', text: '#4A4240', dot: '#8A7E7A' },
  hospital_visit: { bg: '#E6F3F3', text: '#1E5858', dot: '#3A8888' },
  counseling: { bg: '#F0ECF8', text: '#4A3272', dot: '#7A62AA' },
  speaking: { bg: '#FEF0E4', text: '#7A3E18', dot: '#B86030' },
  meeting: { bg: '#EBEBEB', text: '#424242', dot: '#888888' },
};

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  sermon_prep: 'Sermon Prep',
  personal: 'Personal',
  counseling: 'Counseling',
  study: 'Study',
};

export const NOTE_TYPE_COLORS: Record<NoteType, { bg: string; text: string; border: string }> = {
  sermon_prep: { bg: '#FEF3E2', text: '#8A5A0A', border: '#D4922A' },
  personal: { bg: '#E8F2FA', text: '#1A4A7A', border: '#4A80BB' },
  counseling: { bg: '#F0ECF8', text: '#4A3272', border: '#7A62AA' },
  study: { bg: '#E6F3EC', text: '#1A5A38', border: '#3A8858' },
};
