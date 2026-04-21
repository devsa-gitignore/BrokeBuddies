'use client'

import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  Handle,
  Position,
  ConnectionLineType,
  BaseEdge,
  getStraightPath,
  EdgeProps,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion } from 'framer-motion'
import { Shield, Globe, Lock, AlertCircle, Terminal, Mail, Github, Link2 } from 'lucide-react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
  forceCenter,
  forceRadial,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from 'd3-force'

// --- Types ---

interface Profile {
  platform: string
  url: string
  username: string
  found: boolean
  verified?: boolean
}

interface Breach {
  name: string
  title: string
  breached_data: string[]
  breach_date: string
  severity: string
}

interface Secret {
  type: string
  value: string
  file: string
  severity: string
}

interface GraphData {
  email: string
  profiles: Profile[]
  breaches: Breach[]
  secrets: Secret[]
}

interface D3Node extends SimulationNodeDatum {
  id: string
  data: any
  type: string
}

interface D3Link extends SimulationLinkDatum<D3Node> {
  id: string
  source: string | D3Node
  target: string | D3Node
}

// --- Custom Obsidian Node ---

const ObsidianNode = ({ data, selected }: any) => {
  const isCenter = data.type === 'center'
  const isCritical = data.severity === 'high' || data.severity === 'critical'
  const isVerified = data.verified

  return (
    <div className="group relative flex items-center justify-center">
      <Handle type="target" position={Position.Top} className="opacity-0 pointer-events-none" />
      
      {/* The Core Dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          boxShadow: isCenter 
            ? '0 0 20px var(--primary)' 
            : isCritical 
              ? '0 0 15px var(--destructive)' 
              : isVerified 
                ? '0 0 10px var(--primary)' 
                : 'none'
        }}
        className={`rounded-full transition-all duration-500 relative z-10 ${
          isCenter 
            ? 'w-4 h-4 bg-primary' 
            : isCritical
              ? 'w-3 h-3 bg-destructive'
              : isVerified
                ? 'w-2.5 h-2.5 bg-primary'
                : 'w-2 h-2 bg-muted-foreground/60 group-hover:bg-primary'
        } ${selected ? 'ring-4 ring-primary/30 scale-125' : ''}`}
      />

      {/* Ripple/Aura (for center or critical nodes) */}
      {(isCenter || isCritical) && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className={`absolute rounded-full pointer-events-none ${
            isCenter ? 'w-8 h-8 bg-primary/20' : 'w-6 h-6 bg-destructive/20'
          }`}
        />
      )}

      {/* Label */}
      <div className={`absolute top-full mt-3 whitespace-nowrap transition-all duration-300 pointer-events-none ${
        selected ? 'opacity-100 translate-y-0 scale-100' : 'opacity-40 group-hover:opacity-100 group-hover:translate-y-1 scale-90 group-hover:scale-100'
      }`}>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-mono tracking-tighter uppercase opacity-60 mb-0.5">
            {data.label_top}
          </span>
          <span className={`text-[11px] font-bold font-mono tracking-tight px-2 py-0.5 rounded border border-transparent ${
            isCenter 
              ? 'text-primary' 
              : isCritical
                ? 'text-destructive bg-destructive/5'
                : 'text-foreground'
          }`}>
            {data.label}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0 pointer-events-none" />
    </div>
  )
}

// --- Minimalist Obsidian Edge ---

const ObsidianEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{
        ...style,
        stroke: 'var(--primary)',
        opacity: selected ? 0.6 : 0.15,
        strokeWidth: selected ? 1.5 : 1,
        transition: 'opacity 0.3s, stroke-width 0.3s',
      }} />
      {selected && (
        <circle r="2" fill="var(--primary)" opacity="0.6">
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  )
}

const nodeTypes = {
  obsidian: ObsidianNode,
}

const edgeTypes = {
  obsidian: ObsidianEdge,
}

// --- Main Reactive Physics Component ---

export function GraphVisualization({ email, profiles, breaches, secrets }: GraphData) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)
  
  // Use a ref to store the simulation to avoid re-renders
  const simulationRef = useRef<any>(null)

  // Initialize nodes and edges when data changes
  useEffect(() => {
    const initialNodes: Node[] = [
      {
        id: 'center',
        type: 'obsidian',
        position: { x: 0, y: 0 },
        data: { label: email, label_top: 'TARGET', type: 'center', tier: 0 },
      },
    ]
    const initialEdges: Edge[] = []

    profiles.forEach((profile, idx) => {
      const nodeId = `profile-${idx}`
      initialNodes.push({
        id: nodeId,
        type: 'obsidian',
        position: { x: (idx + 1) * 100, y: 100 }, // Initial position, will be overridden by simulation
        data: { label: profile.username, label_top: profile.platform, verified: profile.verified, tier: 1 },
      })
      initialEdges.push({ id: `e-center-${nodeId}`, source: 'center', target: nodeId, type: 'obsidian' })

      if (profile.platform.toLowerCase() === 'github') {
        secrets.forEach((secret, sIdx) => {
          const secretId = `secret-${sIdx}`
          initialNodes.push({
            id: secretId,
            type: 'obsidian',
            position: { x: (idx + 1) * 150, y: 200 },
            data: { label: secret.type, label_top: 'SECRET', severity: secret.severity, tier: 2 },
          })
          initialEdges.push({ id: `e-${nodeId}-${secretId}`, source: nodeId, target: secretId, type: 'obsidian' })
        })
      }
    })

    breaches.forEach((breach, idx) => {
      const nodeId = `breach-${idx}`
      initialNodes.push({
        id: nodeId,
        type: 'obsidian',
        position: { x: (idx + 1) * -100, y: -100 },
        data: { label: breach.name, label_top: 'BREACH', severity: breach.severity, tier: 3 },
      })
      initialEdges.push({ id: `e-center-${nodeId}`, source: 'center', target: nodeId, type: 'obsidian' })
    })

    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [email, profiles, breaches, secrets, setNodes, setEdges])

  // Setup D3 Simulation
  useEffect(() => {
    if (nodes.length === 0) return

    // Clean up previous simulation
    if (simulationRef.current) simulationRef.current.stop()

    const d3Nodes: D3Node[] = nodes.map((node) => ({
      ...node,
      x: node.position.x,
      y: node.position.y,
    }))

    const d3Links: D3Link[] = edges.map((edge) => ({
      ...edge,
      source: edge.source,
      target: edge.target,
    }))

    simulationRef.current = forceSimulation<D3Node>(d3Nodes)
      .force('link', forceLink<D3Node, D3Link>(d3Links).id((d) => d.id).distance(150).strength(1))
      .force('charge', forceManyBody().strength(-800))
      .force('center', forceCenter(0, 0).strength(0.05))
      // Radial force to maintain tiers
      .force('radial', forceRadial((d: D3Node) => {
        const tier = d.data.tier || 0
        if (tier === 0) return 0
        if (tier === 1) return 220
        if (tier === 2) return 340
        return 450
      }, 0, 0).strength(0.8))
      .on('tick', () => {
        setNodes((nds) =>
          nds.map((node) => {
            const d3Node = d3Nodes.find((n) => n.id === node.id)
            if (d3Node) {
              return {
                ...node,
                position: { x: d3Node.x || 0, y: d3Node.y || 0 },
              }
            }
            return node
          })
        )
      })

    return () => {
      if (simulationRef.current) simulationRef.current.stop()
    }
  }, [nodes.length, edges.length]) // Only restart on structural changes

  const onNodeDragStart = useCallback(() => {
    if (simulationRef.current) simulationRef.current.alphaTarget(0.3).restart()
  }, [])

  const onNodeDrag = useCallback((event: any, node: Node) => {
    if (simulationRef.current) {
      const d3Node = simulationRef.current.nodes().find((n: any) => n.id === node.id)
      if (d3Node) {
        d3Node.fx = node.position.x
        d3Node.fy = node.position.y
      }
    }
  }, [])

  const onNodeDragEnd = useCallback((event: any, node: Node) => {
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0)
      const d3Node = simulationRef.current.nodes().find((n: any) => n.id === node.id)
      if (d3Node) {
        d3Node.fx = null
        d3Node.fy = null
      }
    }
  }, [])

  return (
    <div className="w-full h-[600px] bg-[#050505] rounded-3xl border border-primary/5 shadow-2xl overflow-hidden relative group">
      {/* Interactive Title Overlay */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1 pointer-events-none select-none">
        <h3 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          KNOWLEDGE GRAPH
        </h3>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">Force-directed entity topology active</p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragEnd={onNodeDragEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.Straight}
        onInit={setRfInstance}
        fitView
        className="bg-transparent"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background 
          color="#111" 
          variant={BackgroundVariant.Dots} 
          gap={30} 
          size={1} 
          className="opacity-40"
        />
        <Controls className="!bg-black/50 !backdrop-blur-md !border-white/5 !rounded-lg !overflow-hidden translate-x-2" />
      </ReactFlow>

      {/* HUD Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 pointer-events-none flex justify-between items-end bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-mono text-primary font-bold">PHYSICS</span>
            <span className="text-xs font-mono text-foreground tracking-tighter">REACTIVE D3 SIMULATION</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-mono text-muted-foreground font-bold">TOPOLOGY</span>
            <span className="text-xs font-mono text-foreground font-bold">{nodes.length} NODES</span>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700">
           <span className="text-[9px] font-mono text-muted-foreground tracking-widest">DRAG NODES TO DISTURB EQUILIBRIUM</span>
        </div>
      </div>
    </div>
  )
}
