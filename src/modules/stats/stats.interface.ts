export interface StatsResumeI {
  name: string;
  type: string;
  items: StatsResumeItemI[];
}

export interface StatsResumeItemI {
  name: string;
  total: number;
  id: string;
}
