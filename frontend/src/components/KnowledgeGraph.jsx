import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

/**
 * KnowledgeGraph Component
 * Visually displays the entities and relationships of a subject.
 * Converts {nodes, edges} to {nodes, links} for the ForceGraph format.
 */
const KnowledgeGraph = ({ graphData }) => {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    // Automatically set the canvas to match its container size
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({ width: clientWidth, height: clientHeight });
    }
  }, []);

  // Use default data if none is provided
  const data = graphData && graphData.nodes ? {
    nodes: graphData.nodes.map(n => ({ id: n.id, name: n.label, val: 1.5 })),
    links: (graphData.edges || []).map(e => ({ source: e.from, target: e.to, name: e.label }))
  } : {
    nodes: [
      { id: '1', name: 'Wait...', val: 1.5 },
      { id: '2', name: 'Generating Map...', val: 1.5 }
    ],
    links: [
      { source: '1', target: '2', name: '...' }
    ]
  };

  useEffect(() => {
    // Re-center graph when data changes
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current.d3Force('charge').strength(-400); // Spread nodes apart
        fgRef.current.zoomToFit(400);
      }, 500);
    }
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden rounded-2xl bg-[#0A0D14]/80">
      {/* Subtle overlay elements for styling */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl border border-slate-700/30 z-10" />
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Concept Map</h3>
      </div>
      
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={data}
          nodeLabel="name"
          nodeColor={() => '#94A3B8'} // Slate 400
          nodeRelSize={6}
          linkColor={() => 'rgba(148, 163, 184, 0.2)'} // Subtle slate for links
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.25}
          // Custom render to draw labels inside/near nodes if desired
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Inter, Sans-Serif`;
            
            // Draw Node Circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#cbd5e1'; // Slate 300
            ctx.fill();
            
            // Draw Text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#F8FAFC'; // Pure white text
            ctx.fillText(label, node.x, node.y + 8 + fontSize/2); // slightly below node
          }}
          // Customize link text drawing
          linkCanvasObjectMode={() => 'after'}
          linkCanvasObject={(link, ctx, globalScale) => {
            const MAX_FONT_SIZE = 4;
            const LABEL_NODE_MARGIN = fgRef.current ? fgRef.current.nodeRelSize() * 1.5 : 6;

            const start = link.source;
            const end = link.target;
            if (typeof start !== 'object' || typeof end !== 'object') return;

            // Simple midpoint for link label
            const textPos = Object.assign(...['x', 'y'].map(c => ({
              [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
            })));

            const relLink = { x: end.x - start.x, y: end.y - start.y };
            let textAngle = Math.atan2(relLink.y, relLink.x);
            if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
            if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

            const label = link.name;
            if (!label) return;

            const fontSize = 10 / globalScale;
            ctx.font = `${fontSize}px Inter, Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

            ctx.save();
            ctx.translate(textPos.x, textPos.y);
            ctx.rotate(textAngle);

            ctx.fillStyle = 'rgba(10, 13, 20, 0.8)';
            ctx.fillRect(- bckgDimensions[0] / 2, - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#64748b'; // Slate 500
            ctx.fillText(label, 0, 0);
            ctx.restore();
          }}
        />
      )}
    </div>
  );
};

export default KnowledgeGraph;
