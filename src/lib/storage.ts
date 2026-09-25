import Dexie, { type EntityTable } from 'dexie';
import type { Presentation, ProjectMeta } from '../types';

interface StoredProject {
  id: string;
  title: string;
  updatedAt: number;
  slideCount: number;
  schemaVersion: number;
  json: string;
}

class PptDb extends Dexie {
  projects!: EntityTable<StoredProject, 'id'>;

  constructor() {
    super('oscar-html-ppt');
    this.version(1).stores({
      projects: 'id, title, updatedAt, schemaVersion',
    });
  }
}

const db = new PptDb();

export async function saveProject(p: Presentation): Promise<void> {
  const stored: StoredProject = {
    id: p.id,
    title: p.title,
    updatedAt: p.updatedAt,
    slideCount: p.slides.length,
    schemaVersion: p.schemaVersion,
    json: JSON.stringify(p),
  };
  await db.projects.put(stored);
}

export async function loadProject(id: string): Promise<Presentation | null> {
  const stored = await db.projects.get(id);
  if (!stored) return null;
  try {
    return JSON.parse(stored.json) as Presentation;
  } catch (e) {
    console.error('Failed to parse project', e);
    return null;
  }
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const all = await db.projects.orderBy('updatedAt').reverse().toArray();
  return all.map(({ id, title, updatedAt, slideCount, schemaVersion }) => ({
    id,
    title,
    updatedAt,
    slideCount,
    schemaVersion,
  }));
}

export async function renameProject(id: string, title: string): Promise<void> {
  const stored = await db.projects.get(id);
  if (!stored) return;
  stored.title = title;
  stored.updatedAt = Date.now();
  await db.projects.put(stored);
}