import React from 'react'
import { DefaultEdgeOptions, MarkerType } from 'reactflow'
import { Graph, SiteNode } from '@/collections/SiteMaps/component/type'

export const btnBase: React.CSSProperties = {
  appearance: 'none',
  border: '1px solid #d4d4d8',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.95)',
  padding: 6,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
};

export const pillBtn: React.CSSProperties = {
  ...btnBase,
  borderRadius: 8,
  padding: '2px 10px',
  fontSize: 12,
  fontWeight: 600,
};

export const panelWrap: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  background: 'rgba(255,255,255,0.9)',
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  padding: 8,
  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
};

export const inspectorWrap: React.CSSProperties = {
  minWidth: 280,
  maxWidth: 340,
  background: 'rgba(255,255,255,0.98)',
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  padding: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#111827',
  marginBottom: 6,
};

export const textInput: React.CSSProperties = {
  width: '100%',
  height: 34,
  border: '1px solid #d4d4d8',
  borderRadius: 8,
  padding: '0 8px',
  fontSize: 13,
  outline: 'none',
};

export const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 90,
  border: '1px solid #d4d4d8',
  borderRadius: 8,
  padding: 8,
  fontSize: 13,
  outline: 'none',
  resize: 'vertical',
};

export const selectStyle: React.CSSProperties = {
  width: '100%',
  height: 34,
  border: '1px solid #d4d4d8',
  borderRadius: 8,
  padding: '0 8px',
  fontSize: 13,
  outline: 'none',
  background: 'white',
};

export const cardBase = (isRoot: boolean, NODE_W: number, NODE_H: number): React.CSSProperties => ({
  width: NODE_W,
  height: NODE_H,
  background: isRoot ? '#eef4ff' : '#ffffff',
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  position: 'relative',
  padding: 10,
  pointerEvents: 'all',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 600,
  textAlign: 'center',
});
