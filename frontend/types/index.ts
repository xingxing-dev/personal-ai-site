export interface Source {
  source: string;
  title: string;
  category: string;
  content: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}

export interface NavItem {
  id: string;
  labelKey: string;
  href: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface ProjectItem {
  title: string;
  desc: string;
  tags: string[];
  period: string;
  type?: string;
  mentor?: string;
}

export interface SkillItem {
  name: string;
  level: "expert" | "proficient" | "familiar";
}

export interface SkillCategory {
  name: string;
  skills: SkillItem[];
}

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
  desc: string;
}

export interface AwardItem {
  title: string;
  award: string;
  year: string;
}

export interface ContactItem {
  label: string;
  value: string;
  icon: string;
}
