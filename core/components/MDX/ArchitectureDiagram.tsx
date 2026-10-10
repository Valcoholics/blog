import { CSSProperties, useEffect, useId, useRef, useState } from 'react';

import styles from './ArchitectureDiagram.module.css';

type Position = [row: number, column: number, span: number];
type Node = {
  id: string;
  label: string;
  detail?: string;
  position: Position;
  mobile?: Position;
};
type Route = 'left' | 'right';
type Edge = {
  from: string;
  to: string;
  route?: Route;
  mobileRoute?: Route;
};
type Diagram = {
  title: string;
  caption: string;
  nodes: Node[];
  edges: Edge[];
};
type Bounds = { x: number; y: number; width: number; height: number };

const diagrams: Record<'catalog' | 'playback' | 'rendering', Diagram> = {
  catalog: {
    title: 'Catalog and editing architecture',
    caption:
      'Catalog import, editorial publication, and shared views form separate layers of the archive.',
    nodes: [
      {
        id: 'metadata',
        label: 'Bandcamp public metadata',
        position: [1, 1, 2],
        mobile: [1, 1, 6],
      },
      {
        id: 'import',
        label: 'Validated metadata import',
        position: [2, 1, 2],
        mobile: [2, 1, 6],
      },
      {
        id: 'snapshot',
        label: 'Saved catalog snapshot',
        position: [3, 1, 2],
        mobile: [3, 1, 3],
      },
      {
        id: 'curated',
        label: 'Curated release records',
        position: [3, 3, 2],
        mobile: [3, 4, 3],
      },
      {
        id: 'merge',
        label: 'Preserve release IDs and relationships',
        position: [4, 1, 4],
        mobile: [4, 1, 6],
      },
      {
        id: 'local',
        label: 'Bundled editorial content',
        detail: 'Local mode',
        position: [1, 5, 2],
        mobile: [5, 1, 3],
      },
      {
        id: 'feed',
        label: 'Published editorial feed',
        position: [1, 3, 2],
        mobile: [5, 4, 3],
      },
      {
        id: 'cache',
        label: 'Cached read and publication invalidation',
        detail: 'Connected mode',
        position: [2, 3, 2],
        mobile: [6, 4, 3],
      },
      {
        id: 'adapter',
        label: 'Validate and adapt editorial content',
        detail: 'Permitted overrides and artist selections',
        position: [3, 5, 2],
        mobile: [7, 1, 6],
      },
      {
        id: 'catalog',
        label: 'Effective catalog and editorial content',
        position: [5, 2, 4],
        mobile: [8, 1, 6],
      },
      {
        id: 'archive',
        label: 'Archive',
        position: [6, 1, 3],
        mobile: [9, 1, 3],
      },
      {
        id: 'artists',
        label: 'Artist profiles',
        position: [6, 4, 3],
        mobile: [9, 4, 3],
      },
      {
        id: 'detail',
        label: 'Release pages',
        position: [7, 1, 3],
        mobile: [10, 1, 3],
      },
      {
        id: 'player',
        label: 'Shared player catalog',
        position: [7, 4, 3],
        mobile: [10, 4, 3],
      },
    ],
    edges: [
      { from: 'metadata', to: 'import' },
      { from: 'import', to: 'snapshot' },
      { from: 'snapshot', to: 'merge' },
      { from: 'curated', to: 'merge' },
      { from: 'local', to: 'adapter' },
      { from: 'feed', to: 'cache' },
      { from: 'cache', to: 'adapter' },
      { from: 'merge', to: 'catalog', mobileRoute: 'left' },
      { from: 'adapter', to: 'catalog' },
      { from: 'catalog', to: 'archive' },
      { from: 'catalog', to: 'artists' },
      { from: 'catalog', to: 'detail', route: 'left' },
      { from: 'catalog', to: 'player', route: 'right' },
    ],
  },
  playback: {
    title: 'Radio playback architecture',
    caption:
      'The root player retains one native session through internal navigation. Preview identity is checked before audio is delivered.',
    nodes: [
      {
        id: 'gesture',
        label: 'Artwork or Play preview gesture',
        position: [1, 1, 3],
        mobile: [1, 1, 6],
      },
      {
        id: 'unlock',
        label: 'Select release and unlock Web Audio',
        position: [2, 1, 3],
        mobile: [2, 1, 6],
      },
      {
        id: 'resolve',
        label: 'Resolve eligible preview identity',
        position: [3, 1, 3],
        mobile: [3, 1, 6],
      },
      {
        id: 'pinned',
        label: 'Return fingerprint and stream path',
        position: [4, 1, 3],
        mobile: [4, 1, 6],
      },
      {
        id: 'check',
        label: 'Recheck selection and stream audio',
        position: [5, 1, 3],
        mobile: [5, 1, 6],
      },
      {
        id: 'nav',
        label: 'Internal page navigation',
        detail: 'Same session',
        position: [1, 4, 3],
        mobile: [6, 1, 3],
      },
      {
        id: 'root',
        label: 'Player retained in the root layout',
        position: [2, 4, 3],
        mobile: [6, 4, 3],
      },
      {
        id: 'audio',
        label: 'One native audio element',
        position: [6, 2, 4],
        mobile: [7, 1, 6],
      },
      {
        id: 'controls',
        label: 'Playback, seeking, volume and progress',
        position: [7, 2, 4],
        mobile: [8, 1, 6],
      },
    ],
    edges: [
      { from: 'gesture', to: 'unlock' },
      { from: 'unlock', to: 'resolve' },
      { from: 'resolve', to: 'pinned' },
      { from: 'pinned', to: 'check' },
      { from: 'check', to: 'audio', mobileRoute: 'left' },
      { from: 'nav', to: 'root' },
      { from: 'root', to: 'audio' },
      { from: 'audio', to: 'controls' },
    ],
  },
  rendering: {
    title: 'Visual rendering architecture',
    caption:
      'Audio analysis and artwork sampling meet in the renderer. Audio output continues through its own path.',
    nodes: [
      { id: 'audio', label: 'Native audio element', position: [1, 1, 3] },
      { id: 'analyse', label: 'Web Audio analyser', position: [2, 1, 3] },
      {
        id: 'bands',
        label: 'Approximate bass, mids and treble',
        position: [3, 1, 3],
      },
      { id: 'gain', label: 'Gain and audio output', position: [3, 4, 3] },
      { id: 'artwork', label: 'Selected release artwork', position: [1, 4, 3] },
      { id: 'sample', label: 'Sampled color palette', position: [2, 4, 3] },
      {
        id: 'motion',
        label: 'Reduced motion preference',
        detail: 'Static drawing',
        position: [4, 1, 3],
      },
      { id: 'mode', label: 'Artwork, Wordmark or Both', position: [4, 4, 3] },
      {
        id: 'render',
        label: 'WebGL renderer',
        position: [5, 2, 4],
        mobile: [5, 1, 6],
      },
      {
        id: 'scene',
        label: 'Visual composition',
        position: [6, 2, 4],
        mobile: [6, 1, 6],
      },
    ],
    edges: [
      { from: 'audio', to: 'analyse' },
      { from: 'analyse', to: 'gain' },
      { from: 'analyse', to: 'bands' },
      { from: 'bands', to: 'render', route: 'left' },
      { from: 'artwork', to: 'sample' },
      { from: 'sample', to: 'render', route: 'right' },
      { from: 'mode', to: 'render' },
      { from: 'motion', to: 'render' },
      { from: 'render', to: 'scene' },
    ],
  },
};

function connection(from: Bounds, to: Bounds, width: number, route?: Route) {
  if (route) {
    const isLeft = route === 'left';
    const startX = from.x + (isLeft ? 0 : from.width);
    const endX = to.x + (isLeft ? 0 : to.width);
    const lane = isLeft ? 3 : width - 3;
    return `M${startX},${from.y + from.height / 2} H${lane} V${to.y + to.height / 2} H${endX}`;
  }

  if (Math.abs(from.y - to.y) < 2) {
    return `M${from.x + from.width},${from.y + from.height / 2} H${to.x}`;
  }

  const startX = from.x + from.width / 2;
  const startY = from.y + from.height;
  const endX = to.x + to.width / 2;
  const bendY = to.y - 23;
  return `M${startX},${startY} V${bendY} H${endX} V${to.y}`;
}

export default function ArchitectureDiagram({
  variant,
}: {
  variant: keyof typeof diagrams;
}) {
  const diagram = diagrams[variant];
  const chartRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const markerId = `flow-arrow-${id}`;
  const captionId = `flow-caption-${id}`;
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    let active = true;

    const measure = () => {
      if (!active) return;
      const rect = chart.getBoundingClientRect();
      const mobile = window.matchMedia('(max-width: 520px)').matches;
      const bounds = new Map<string, Bounds>();
      chart
        .querySelectorAll<HTMLElement>('[data-flow-node]')
        .forEach((node) => {
          const box = node.getBoundingClientRect();
          bounds.set(node.dataset.flowNode!, {
            x: box.x - rect.x,
            y: box.y - rect.y,
            width: box.width,
            height: box.height,
          });
        });
      const next = diagram.edges.map((edge) =>
        connection(
          bounds.get(edge.from)!,
          bounds.get(edge.to)!,
          rect.width,
          mobile ? (edge.mobileRoute ?? edge.route) : edge.route
        )
      );
      setPaths((previous) =>
        previous.join('|') === next.join('|') ? previous : next
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(chart);
    chart
      .querySelectorAll('[data-flow-node]')
      .forEach((node) => observer.observe(node));
    measure();
    document.fonts.ready.then(measure);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [diagram]);

  return (
    <figure
      className={styles.figure}
      aria-label={diagram.title}
      aria-describedby={captionId}
      data-architecture-diagram={variant}
    >
      <div className={styles.chart} ref={chartRef}>
        <svg className={styles.connectors} aria-hidden="true" focusable="false">
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path
                d="M1 1 L7 4 L1 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </marker>
          </defs>
          {paths.map((path, index) => (
            <path
              key={`${diagram.edges[index].from}-${diagram.edges[index].to}`}
              d={path}
              markerEnd={`url(#${markerId})`}
            />
          ))}
        </svg>
        {diagram.nodes.map((node) => {
          const mobile = node.mobile ?? node.position;
          return (
            <div
              key={node.id}
              className={styles.node}
              data-flow-node={node.id}
              style={
                {
                  '--flow-row': node.position[0],
                  '--flow-column': node.position[1],
                  '--flow-span': node.position[2],
                  '--flow-mobile-row': mobile[0],
                  '--flow-mobile-column': mobile[1],
                  '--flow-mobile-span': mobile[2],
                } as CSSProperties
              }
            >
              <span>{node.label}</span>
              {node.detail ? (
                <span className={styles.detail}>{node.detail}</span>
              ) : null}
            </div>
          );
        })}
      </div>
      <figcaption id={captionId} className={styles.caption}>
        {diagram.caption}
      </figcaption>
      <ul className={styles.relationships}>
        {diagram.edges.map((edge) => (
          <li key={`${edge.from}-${edge.to}`}>
            {diagram.nodes.find((node) => node.id === edge.from)!.label} leads
            to {diagram.nodes.find((node) => node.id === edge.to)!.label}.
          </li>
        ))}
      </ul>
    </figure>
  );
}
