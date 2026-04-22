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
import { Terminal } from 'lucide-react'
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


const ObsidianNode = React.memo(({ data, selected }: any) => {
  const isCenter = data.type === 'center'
  const isCritical = data.severity === 'high' || data.severity === 'critical'
  const isVerified = data.verified

  return (
    <div className="group relative flex items-center justify-center">
      <Handle type="target" position={Position.Top} className="opacity-0 pointer-events-none" />

      {/* The Core Dot */}
      <div
        className={`rounded-full transition-all duration-300 relative z-10 ${isCenter
          ? 'w-4 h-4 bg-primary ring-4 ring-primary/20'
          : isCritical
            ? 'w-3 h-3 bg-destructive ring-4 ring-destructive/20'
            : isVerified
              ? 'w-2.5 h-2.5 bg-primary ring-2 ring-primary/10'
              : 'w-2 h-2 bg-muted-foreground/60 group-hover:bg-primary'
          } ${selected ? 'ring-4 ring-primary/50 scale-125' : ''}`}
      />

      {/* Ripple/Aura (for center or critical nodes) */}
      {(isCenter || isCritical) && (
        <div
          className={`absolute rounded-full pointer-events-none animate-ping ${isCenter ? 'w-8 h-8 bg-primary/20' : 'w-6 h-6 bg-destructive/20'
            }`}
          style={{ animationDuration: '3s' }}
        />
      )}

      {/* Label */}
      <div
        className={`absolute top-full mt-3 whitespace-nowrap transition-all duration-300 pointer-events-none ${selected
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 group-hover:opacity-100 group-hover:translate-y-1 scale-90 group-hover:scale-100'
          }`}
      >
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-mono tracking-tighter uppercase opacity-60 mb-0.5">
            {data.label_top}
          </span>
          <span
            className={`text-[11px] font-bold font-mono tracking-tight px-2 py-0.5 rounded border border-transparent ${isCenter
              ? 'text-primary'
              : isCritical
                ? 'text-destructive bg-destructive/5'
                : 'text-foreground bg-background/80 backdrop-blur-xs'
              }`}
          >
            {data.label}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0 pointer-events-none" />
    </div>
  )
})
ObsidianNode.displayName = 'ObsidianNode'

const ObsidianEdge = React.memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) => {
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY })

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: 'var(--primary)',
          opacity: selected ? 0.6 : 0.15,
          strokeWidth: selected ? 1.5 : 1,
          transition: 'opacity 0.3s, stroke-width 0.3s',
        }}
      />
      {selected && (
        <circle r="2" fill="var(--primary)" opacity="0.6">
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  )
})
ObsidianEdge.displayName = 'ObsidianEdge'

const nodeTypes = { obsidian: ObsidianNode }
const edgeTypes = { obsidian: ObsidianEdge }

// --- Helpers ---

function buildGraph(email: string, profiles: Profile[], breaches: Breach[], secrets: Secret[]) {
  const initialNodes: Node[] = [
    {
      id: 'center',
      type: 'obsidian',
      position: { x: 0, y: 0 },
      data: { label: email, label_top: 'TARGET', type: 'center', tier: 0 },
    },
  ]
  const initialEdges: Edge[] = []

  // Deduplicate secrets (added once, not per GitHub profile)
  const secretNodeIds = new Set<string>()
  let githubProfileId: string | null = null

  profiles.forEach((profile, idx) => {
    const nodeId = `profile-${idx}`
    initialNodes.push({
      id: nodeId,
      type: 'obsidian',
      position: { x: (idx + 1) * 100, y: 100 },
      data: { label: profile.username, label_top: profile.platform, verified: profile.verified, tier: 1 },
    })
    initialEdges.push({ id: `e-center-${nodeId}`, source: 'center', target: nodeId, type: 'obsidian' })

    if (profile.platform.toLowerCase() === 'github' && !githubProfileId) {
      githubProfileId = nodeId
    }
  })

  if (secrets.length > 0) {
    const secretParent = githubProfileId ?? 'center'
    secrets.forEach((secret, sIdx) => {
      const secretId = `secret-${sIdx}`
      if (!secretNodeIds.has(secretId)) {
        secretNodeIds.add(secretId)
        initialNodes.push({
          id: secretId,
          type: 'obsidian',
          position: { x: sIdx * 150, y: 200 },
          data: { label: secret.type, label_top: 'SECRET', severity: secret.severity, tier: 2 },
        })
        initialEdges.push({ id: `e-${secretParent}-${secretId}`, source: secretParent, target: secretId, type: 'obsidian' })
      }
    })
  }

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

  return { initialNodes, initialEdges }
}

// --- Main Reactive Physics Component ---

export function GraphVisualization({ email, profiles, breaches, secrets }: GraphData) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)

  // Stable ref to the simulation; avoids triggering re-renders on tick
  const simulationRef = useRef<any>(null)

  // Ref to the live D3 node array — updated each tick WITHOUT touching React state
  const d3NodesRef = useRef<D3Node[]>([])

  // Ref to a Map for O(1) node lookup by id
  const d3NodeMapRef = useRef<Map<string, D3Node>>(new Map())

  // Track a stable key representing the graph structure
  const structureKey = useMemo(
    () => `${email}|${profiles.length}|${breaches.length}|${secrets.length}`,
    [email, profiles.length, breaches.length, secrets.length]
  )

  // ── Step 1: Build and set nodes/edges only when structure changes ──
  useEffect(() => {
    const { initialNodes, initialEdges } = buildGraph(email, profiles, breaches, secrets)
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [structureKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step 2: Start D3 simulation after nodes are set ──
  useEffect(() => {
    if (nodes.length === 0) return

    // Stop previous simulation
    if (simulationRef.current) simulationRef.current.stop()

    // Build D3 node list with initial positions from React state
    const d3Nodes: D3Node[] = nodes.map((node) => ({
      ...node,
      x: node.position.x,
      y: node.position.y,
    }) as D3Node)

    // Build an O(1) lookup map
    const nodeMap = new Map<string, D3Node>(d3Nodes.map((n) => [n.id, n]))
    d3NodesRef.current = d3Nodes
    d3NodeMapRef.current = nodeMap

    const d3Links: D3Link[] = edges.map((edge) => ({
      ...edge,
      source: edge.source,
      target: edge.target,
    }))

    // Use a frame-based batch update to avoid flooding React with state updates
    let rafId: number | null = null

    simulationRef.current = forceSimulation<D3Node>(d3Nodes)
      .alphaDecay(0.028)           // ~150 ticks to settle
      .velocityDecay(0.4)          // dampen oscillations faster
      .force(
        'link',
        forceLink<D3Node, D3Link>(d3Links)
          .id((d) => d.id)
          .distance(150)
          .strength(0.8)
      )
      .force('charge', forceManyBody().strength(-600).distanceMax(500))
      .force('center', forceCenter(0, 0).strength(0.05))
      .force(
        'radial',
        forceRadial(
          (d: D3Node) => {
            const tier = d.data?.tier ?? 0
            if (tier === 0) return 0
            if (tier === 1) return 220
            if (tier === 2) return 340
            return 450
          },
          0,
          0
        ).strength(0.8)
      )
      .on('tick', () => {
        // Batch React state update with requestAnimationFrame to cap at 60fps
        if (rafId !== null) return
        rafId = requestAnimationFrame(() => {
          rafId = null
          setNodes((nds) =>
            nds.map((node) => {
              const d3Node = d3NodeMapRef.current.get(node.id)
              if (!d3Node) return node
              return {
                ...node,
                position: { x: d3Node.x ?? node.position.x, y: d3Node.y ?? node.position.y },
              }
            })
          )
        })
      })

    return () => {
      if (simulationRef.current) simulationRef.current.stop()
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [structureKey, edges, rfInstance]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step 3: Automatically frame the graph once the initial explosion settles ──
  useEffect(() => {
    if (!rfInstance || nodes.length === 0) return
    const timer = setTimeout(() => {
      rfInstance.fitView({ padding: 0.2, duration: 1200 })
    }, 1000)
    return () => clearTimeout(timer)
  }, [rfInstance, structureKey, nodes.length])

  const onNodeDragStart = useCallback(() => {
    if (simulationRef.current) simulationRef.current.alphaTarget(0.3).restart()
  }, [])

  const onNodeDrag = useCallback((_event: any, node: Node) => {
    const d3Node = d3NodeMapRef.current.get(node.id)
    if (d3Node) {
      d3Node.fx = node.position.x
      d3Node.fy = node.position.y
    }
  }, [])

  const onNodeDragStop = useCallback((_event: any, node: Node) => {
    if (simulationRef.current) simulationRef.current.alphaTarget(0)
    const d3Node = d3NodeMapRef.current.get(node.id)
    if (d3Node) {
      d3Node.fx = null
      d3Node.fy = null
    }
  }, [])

  return (
    <div className="w-full h-150 bg-[#050505] rounded-3xl border-4 border-primary shadow-[8px_8px_0px_0px_var(--primary)] overflow-hidden relative group mt-8">
      {/* Interactive Title Overlay */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1 pointer-events-none select-none">
        <h3 className="text-2xl font-mono font-bold text-foreground flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          ACCOUNT EXPOSURE TREE
        </h3>
        <p className="text-xl font-mono text-muted-foreground tracking-widest opacity-60">
          Your account, the associated profile and the breaches it has been exposed to
        </p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.Straight}
        onInit={setRfInstance}
        fitView
        className="bg-transparent"
        minZoom={0.05}
        maxZoom={2}
      >
        <Background color="#111" variant={BackgroundVariant.Dots} gap={30} size={1} className="opacity-40" />
        <Controls className="bg-black/50! backdrop-blur-md! border-white/5! rounded-lg! overflow-hidden! translate-x-2 -translate-y-20" />
      </ReactFlow>

      {/* HUD Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 pointer-events-none flex justify-between items-end bg-linear-to-t from-black/80 to-transparent">
        <div className="flex gap-4">

          <div className="flex flex-col gap-0.5">
            <span className="text-md font-mono text-muted-foreground font-bold">TOPOLOGY</span>
            <span className="text-md font-mono text-foreground font-bold">{nodes.length} NODES</span>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <span className="text-s font-mono text-muted-foreground tracking-widest">DRAG NODES TO DISTURB EQUILIBRIUM</span>
        </div>
      </div>
    </div>
  )
}
