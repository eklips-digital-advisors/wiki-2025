'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  DefaultEdgeOptions,
  Panel,
  Handle,
  Position,
  ReactFlowProvider,
  Node as RFNode,
  Edge as RFEdge,
  NodeProps,
  useReactFlow,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useField } from '@payloadcms/ui';
import { nanoid } from 'nanoid';
import { Plus, Trash2 } from 'lucide-react'
import { Graph, SiteEdge, SiteNode, SiteNodeData } from '@/collections/SiteMaps/component/type'
import {
  btnBase,
  cardBase,
  inspectorWrap,
  labelStyle,
  panelWrap,
  pillBtn,
  selectStyle,
  textareaStyle,
  textInput,
} from '@/collections/SiteMaps/component/css'

const TEMPLATE_OPTIONS = ['Default', 'Archive', 'Home', 'Image bank', 'Reports', 'Section'];

/* ===============================
   Layout constants
================================= */
const NODE_W = 180;
const NODE_H = 72;
const H_SPACING = 48;
const V_SPACING = 48;
const GROUP_GAP_X = 140;
const CANVAS_MIN_HEIGHT = 660;

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  style: { stroke: '#64748b', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
};

/* ===============================
   Helpers
================================= */
function getRootId(nodeId: string, index: Map<string, SiteNode>): string {
  let cur = index.get(nodeId);
  while (cur && cur.parentId) cur = index.get(cur.parentId);
  return cur?.id || nodeId;
}

function colorFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 45% 45%)`;
}

function buildIndex(nodes: SiteNode[]) {
  return new Map(nodes.map((n) => [n.id, n]));
}

function isOccupied(
  nodes: SiteNode[],
  idx: Map<string, SiteNode>,
  rootId: string,
  row: number,
  col: number
) {
  return nodes.some(
    (n) => getRootId(n.id, idx) === rootId && n.row === row && n.col === col
  );
}

function childrenOf(nodes: SiteNode[], parentId: string) {
  return nodes.filter((n) => n.parentId === parentId);
}

function firstChildRow(children: SiteNode[], fallbackRow: number) {
  if (!children.length) return fallbackRow;
  return Math.min(...children.map((c) => c.row));
}

function maxCol(children: SiteNode[], row: number) {
  const onRow = children.filter((c) => c.row === row);
  return onRow.length ? Math.max(...onRow.map((c) => c.col)) : null;
}

function computePositions(graph: Graph, layout: 'TD' | 'LR') {
  const idx = new Map(graph.nodes.map((n) => [n.id, n]));
  const roots = graph.nodes.filter((n) => !n.parentId).map((r) => r.id);

  // group by root
  const groups = roots.map((rootId) => {
    const nodes = graph.nodes.filter((n) => getRootId(n.id, idx) === rootId);

    // width in columns (max col + 1), height in rows (max row + 1)
    const widthCols =
      nodes.length ? Math.max(...nodes.map((n) => n.col)) + 1 : 1;
    const heightRows =
      nodes.length ? Math.max(...nodes.map((n) => n.row)) + 1 : 1;

    return { rootId, nodes, widthCols, heightRows };
  });

  const groupOffsetX = new Map<string, number>();
  const groupOffsetY = new Map<string, number>();

  if (layout === 'TD') {
    // stack groups horizontally
    let offX = 0;
    groups.forEach((g) => {
      const pxWidth = g.widthCols * NODE_W + (g.widthCols - 1) * H_SPACING;
      groupOffsetX.set(g.rootId, offX);
      groupOffsetY.set(g.rootId, 0);
      offX += pxWidth + GROUP_GAP_X;
    });
  } else {
    // stack groups vertically
    let offY = 0;
    groups.forEach((g) => {
      const pxHeight = g.widthCols /* columns become vertical span */
        * NODE_H + (g.widthCols - 1) * V_SPACING;
      groupOffsetX.set(g.rootId, 0);
      groupOffsetY.set(g.rootId, offY);
      offY += pxHeight + GROUP_GAP_X; // reuse gap
    });
  }

  const rfNodes: RFNode<SiteNodeData & { layout: 'TD' | 'LR' }>[] = graph.nodes.map((n) => {
    const root = getRootId(n.id, idx);

    const baseX = groupOffsetX.get(root) || 0;
    const baseY = groupOffsetY.get(root) || 0;

    const x = layout === 'TD'
      ? baseX + n.col * (NODE_W + H_SPACING)
      : baseX + n.row * (NODE_W + H_SPACING); // rows go along X in LR

    const y = layout === 'TD'
      ? baseY + n.row * (NODE_H + V_SPACING)
      : baseY + n.col * (NODE_H + V_SPACING); // cols go along Y in LR

    const isRoot = !n.parentId;

    return {
      id: n.id,
      type: 'sitemapNode',
      position: { x, y },
      data: {
        id: n.id,
        title: n.title,
        description: n.description,
        template: n.template,
        isRoot,
        layout, // <-- pass to node
        onDelete: () => {},
        onAddRight: undefined,
        onAddBottom: () => {},
      },
      draggable: false,
      selectable: true,
    };
  });

  const rfEdges: RFEdge[] = graph.edges.map((e) => {
    const stroke = colorFromId(e.source);
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      style: { stroke, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
    };
  });

  return { nodes: rfNodes, edges: rfEdges };
}


type ExportNode = {
  id: string;
  title: string;
  description?: string;
  template?: string;
  children: ExportNode[];
  // optional layout/meta you may want for the importer:
  row: number;
  col: number;
  createdAt: number;
};

function sortNodesForExport(a: SiteNode, b: SiteNode) {
  return a.row - b.row || a.col - b.col || a.createdAt - b.createdAt;
}

function buildExportTree(graph: Graph) {
  // children index
  const childrenByParent = new Map<string, SiteNode[]>();
  graph.nodes.forEach((n) => {
    if (n.parentId) {
      if (!childrenByParent.has(n.parentId)) childrenByParent.set(n.parentId, []);
      childrenByParent.get(n.parentId)!.push(n);
    }
  });
  // sort children lists
  for (const [, list] of childrenByParent) list.sort(sortNodesForExport);

  // roots in stable order
  const roots = graph.nodes.filter((n) => !n.parentId).sort(sortNodesForExport);

  const toExportNode = (n: SiteNode): ExportNode => ({
    id: n.id,
    title: n.title,
    description: n.description || '',
    template: n.template || '',
    row: n.row,
    col: n.col,
    createdAt: n.createdAt,
    children: (childrenByParent.get(n.id) || []).map(toExportNode),
  });

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    roots: roots.map(toExportNode),
  };
}

function downloadJSON(obj: unknown, filename = 'sitemap.json') {
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ===============================
   Custom node
================================= */
const SitemapNode: React.FC<NodeProps<SiteNodeData & { layout: 'TD' | 'LR' }>> = ({ id, data, selected }) => {
  const isTD = data.layout === 'TD';

  return (
    <div style={cardBase(data.isRoot, NODE_W, NODE_H)} onMouseDown={(e) => e.stopPropagation()}>
      {data.title}

      {/* delete */}
      <div style={{ position: 'absolute', right: -14, top: -14 }}>
        <button type="button" title="Delete" onClick={(e) => { e.preventDefault(); e.stopPropagation(); data.onDelete(id); }} style={btnBase}>
          <Trash2 size={12} />
        </button>
      </div>

      {/* handles switch */}
      <Handle
        type="target"
        position={isTD ? Position.Top : Position.Left}
        style={{ width: 8, height: 8, background: '#64748b' }}
        isConnectable={false}
      />
      <Handle
        type="source"
        position={isTD ? Position.Bottom : Position.Right}
        style={{ width: 8, height: 8, background: '#64748b' }}
        isConnectable={false}
      />

      {/* sibling button: right in TD, bottom in LR */}
      {!data.isRoot && (
        <div
          style={
            isTD
              ? { position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)' }
              : { position: 'absolute', left: '50%', bottom: -12, transform: 'translateX(-50%)' }
          }
        >
          <button
            type="button"
            title={isTD ? 'Add sibling to right' : 'Add sibling below'}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); data.onAddRight?.(id); }}
            style={btnBase}
          >
            <Plus size={12} />
          </button>
        </div>
      )}

      {/* child button: bottom in TD, right in LR */}
      <div
        style={
          isTD
            ? { position: 'absolute', left: '50%', bottom: -12, transform: 'translateX(-50%)' }
            : { position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)' }
        }
      >
        <button
          type="button"
          title={isTD ? 'Add child below' : 'Add child to right'}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); data.onAddBottom(id); }}
          style={btnBase}
        >
          <Plus size={12} />
        </button>
      </div>

      {selected && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, pointerEvents: 'none', background: 'rgba(239, 68, 68, 0.05)' }} />
      )}
    </div>
  );
};


const nodeTypes = { sitemapNode: SitemapNode };

/* ===============================
   Main editor
================================= */
const Inner: React.FC = () => {
  const { value: fieldValue, setValue } = useField<Graph>({ path: 'graph' });
  type LayoutMode = 'TD' | 'LR'; // TD = top-down (current), LR = left-right
  const [layout, setLayout] = useState<LayoutMode>('TD');

  const initial: Graph =
    fieldValue && typeof fieldValue === 'object'
      ? (fieldValue as Graph)
      : { nodes: [], edges: [] };

  const [graph, setGraph] = useState<Graph>({
    nodes: (initial.nodes || []).map((n) => ({
      ...n,
      description: n.description || '',
      template: n.template || TEMPLATE_OPTIONS[0],
      row: typeof n.row === 'number' ? n.row : 0,
      col: typeof n.col === 'number' ? n.col : 0,
      createdAt: n.createdAt || Date.now(),
    })),
    edges: initial.edges || [],
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const commit = useCallback(
    (next: Graph) => {
      setGraph(next);
      setValue(next); // marks form dirty; does NOT auto-save
    },
    [setValue]
  );

  const updateNode = useCallback(
    (id: string, patch: Partial<Pick<SiteNode, 'title' | 'description' | 'template'>>) => {
      commit({
        nodes: graph.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        edges: graph.edges,
      });
    },
    [graph, commit]
  );

  const addParent = useCallback(() => {
    const id = nanoid(8);
    const parent: SiteNode = {
      id,
      title: '',
      description: '',
      template: TEMPLATE_OPTIONS[0],
      parentId: null,
      row: 0,
      col: 0,
      createdAt: Date.now(),
    };
    commit({ nodes: [...graph.nodes, parent], edges: graph.edges });
    setSelectedId(id);
     setPendingFocusId(id);
  }, [graph, commit]);

  const addSiblingRight = useCallback(
    (nodeId: string) => {
      const idx = new Map(graph.nodes.map((n) => [n.id, n]));
      const cur = idx.get(nodeId);
      if (!cur || !cur.parentId) return;
      const root = getRootId(nodeId, idx);

      const sameRow = graph.nodes.filter(
        (n) => getRootId(n.id, idx) === root && n.row === cur.row
      );
      const nextCol = sameRow.length ? Math.max(...sameRow.map((n) => n.col)) + 1 : 0;

      const id = nanoid(8);
      const newNode: SiteNode = {
        id,
        title: 'New Page',
        description: '',
        template: TEMPLATE_OPTIONS[0],
        parentId: cur.parentId,
        row: cur.row,
        col: nextCol,
        createdAt: Date.now(),
      };
      const newEdge: SiteEdge = { id: `e-${cur.parentId}-${id}`, source: cur.parentId!, target: id };

      commit({ nodes: [...graph.nodes, newNode], edges: [...graph.edges, newEdge] });
      setSelectedId(id);
    },
    [graph, commit]
  );

  const addChildBottom = useCallback(
    (nodeId: string) => {
      const idx = buildIndex(graph.nodes);
      const parent = idx.get(nodeId);
      if (!parent) return;

      const root = getRootId(nodeId, idx);
      const kids = childrenOf(graph.nodes, nodeId);

      let row: number;
      let col: number;

      if (kids.length === 0) {
        row = parent.row + 1;
        col = parent.col;
        while (isOccupied(graph.nodes, idx, root, row, col)) row += 1;
      } else {
        const baseRow = firstChildRow(kids, parent.row + 1);
        const c = maxCol(kids, baseRow);
        const startCol = c === null ? parent.col : c + 1;
        row = baseRow;
        col = startCol;
        while (isOccupied(graph.nodes, idx, root, row, col)) col += 1;
      }

      const id = nanoid(8);
      const child: SiteNode = {
        id,
        title: '',
        description: '',
        template: TEMPLATE_OPTIONS[0],
        parentId: nodeId,
        row,
        col,
        createdAt: Date.now(),
      };

      const newEdge: SiteEdge = { id: `e-${nodeId}-${id}`, source: nodeId, target: id };

      commit({ nodes: [...graph.nodes, child], edges: [...graph.edges, newEdge] });
      setSelectedId(id);
    },
    [graph, commit]
  );

  const deleteWithSubtree = useCallback(
    (nodeId: string) => {
      const childrenByParent = new Map<string, string[]>();
      graph.edges.forEach((e) => {
        if (!childrenByParent.has(e.source)) childrenByParent.set(e.source, []);
        childrenByParent.get(e.source)!.push(e.target);
      });

      const toDelete = new Set<string>();
      const stack = [nodeId];
      while (stack.length) {
        const cur = stack.pop()!;
        if (toDelete.has(cur)) continue;
        toDelete.add(cur);
        const kids = childrenByParent.get(cur) || [];
        kids.forEach((k) => stack.push(k));
      }

      const nodes = graph.nodes.filter((n) => !toDelete.has(n.id));
      const edges = graph.edges.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target));
      commit({ nodes, edges });

      if (selectedId && toDelete.has(selectedId)) setSelectedId(null);
    },
    [graph, commit, selectedId]
  );

  const handleExportJSON = useCallback(() => {
    const data = buildExportTree(graph);
    const ts = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const filename = `sitemap-${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;
    downloadJSON(data, filename);
  }, [graph]);

  const built = useMemo(() => computePositions(graph, layout), [graph, layout]);
  const { nodes: rfNodes, edges: rfEdges } = useMemo(() => {
    const idSet = new Set(graph.nodes.map((n) => n.id));
    const roots = new Set(graph.nodes.filter((n) => !n.parentId).map((n) => n.id));

    const nodes = built.nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        layout, // <--
        onDelete: deleteWithSubtree,
        onAddRight: roots.has(n.id) ? undefined : addSiblingRight, // same function; just UI label changes
        onAddBottom: addChildBottom,
      } as SiteNodeData & { layout: 'TD' | 'LR' },
    }));

    return {
      nodes,
      edges: built.edges.filter((e) => idSet.has(e.source) && idSet.has(e.target)),
    };
  }, [built, graph.nodes, layout, addSiblingRight, addChildBottom, deleteWithSubtree]);


  const { fitView, setCenter } = useReactFlow();
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);

  useEffect(() => {
    // only auto-fit when there are nodes AND we are not about to focus a specific one
    if (rfNodes.length && !pendingFocusId) {
      fitView({ padding: 0.2, duration: 300 });
    }
  }, [rfNodes.length, pendingFocusId, fitView]);

  useEffect(() => {
    if (!pendingFocusId) return;
    // find the RF node with positions already computed
    const n = rfNodes.find((nn) => nn.id === pendingFocusId);
    if (!n) return;

    // center to the middle of the node (improves visual alignment)
    const x = n.position.x + NODE_W / 2;
    const y = n.position.y + NODE_H / 2;

    setCenter(x, y, { zoom: 1, duration: 400 });
    setPendingFocusId(null);
  }, [pendingFocusId, rfNodes, setCenter]);

  const selectedNode = useMemo(
    () => graph.nodes.find((n) => n.id === selectedId) || null,
    [graph.nodes, selectedId]
  );

  return (
    <div style={{ position: 'relative', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', height: CANVAS_MIN_HEIGHT }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        zoomOnScroll
        panOnDrag
        panOnScroll
        zoomOnPinch
        fitView
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => setSelectedId(node.id)}
        onPaneClick={() => setSelectedId(null)}
        selectionOnDrag={false}
      >
        <Panel position="top-left">
          <div style={panelWrap}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addParent();
              }}
              style={pillBtn}
            >
              + Add parent
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLayout((m) => (m === 'TD' ? 'LR' : 'TD'));
                // re-fit after layout switch
                setTimeout(() => fitView({ padding: 0.2, duration: 250 }), 0);
              }}
              style={pillBtn}
            >
              Layout: {layout === 'TD' ? 'Horizontal' : 'Vertical'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fitView({ padding: 0.2, duration: 300 });
              }}
              style={pillBtn}
            >
              Fit
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleExportJSON();
              }}
              style={pillBtn}
            >
              Export JSON
            </button>
          </div>
        </Panel>

        <Controls showInteractive={false} position="bottom-right" />
        <Background />
        <MiniMap
          zoomable
          pannable
          maskColor="rgba(0,0,0,0.04)"
          nodeColor={(n) => (n?.data as any)?.isRoot ? '#eef4ff' : '#ffffff'}
          nodeStrokeColor={(n) => (n.selected ? '#ef4444' : '#94a3b8')}
          nodeBorderRadius={8}
        />
      </ReactFlow>

      {/* Sticky inspector overlay */}
      {selectedNode && (
        <div
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, ...inspectorWrap }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Node settings</div>

          <label style={labelStyle}>Title</label>
          <input
            type="text"
            value={selectedNode.title}
            onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
            style={textInput}
          />

          <div style={{ height: 10 }} />

          <label style={labelStyle}>Description</label>
          <textarea
            value={selectedNode.description || ''}
            onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
            style={textareaStyle}
          />

          <div style={{ height: 10 }} />

          <label style={labelStyle}>Template</label>
          <select
            value={selectedNode.template || TEMPLATE_OPTIONS[0]}
            onChange={(e) => updateNode(selectedNode.id, { template: e.target.value })}
            style={selectStyle}
          >
            {TEMPLATE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

const SiteMapEditorInnerWrapped: React.FC = () => (
  <ReactFlowProvider>
    <Inner />
  </ReactFlowProvider>
);

export const SiteMapEditor = SiteMapEditorInnerWrapped;
