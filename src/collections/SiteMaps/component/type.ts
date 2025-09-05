/* ===============================
   Types
================================= */
export type Graph = { nodes: SiteNode[]; edges: SiteEdge[] };

export type SiteNode = {
  id: string;
  title: string;
  description?: string;
  template?: string;
  parentId?: string | null;
  row: number;
  col: number;
  createdAt: number;
};

export type SiteEdge = { id: string; source: string; target: string };

export type SiteNodeData = {
  id: string;
  title: string;
  description?: string;
  template?: string;
  isRoot: boolean;
  onAddRight?: (id: string) => void;
  onAddBottom: (id: string) => void;
  onDelete: (id: string) => void;
};
