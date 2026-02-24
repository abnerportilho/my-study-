export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: number;
  endTime: number | null;
  duration: number; // in milliseconds
}
