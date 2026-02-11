import { useEffect, useRef, useState } from 'react';
import maplibre, { type StyleSpecification } from 'maplibre-gl';
// @ts-expect-error -- no typedefs
import adiffParser from '@osmcha/osm-adiff-parser';
// @ts-expect-error -- no typedefs
import { MapLibreAugmentedDiffViewer } from '@osmcha/maplibre-adiff-viewer';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Changeset, OsmFeature } from 'osm-api';

export const OPENSTREETMAP_CARTO_STYLE = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
} satisfies StyleSpecification;

export type SelectedDiff = {
  type: 'create' | 'modify' | 'delete';
  old?: OsmFeature;
  new?: OsmFeature;
};
export type OnSelectDiff = (diff: SelectedDiff) => void;

export const MapRenderer: React.FC<{
  changeset: Changeset;
  onSelect: OnSelectDiff;
}> = ({ changeset, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [aDiffXML, setADiffXML] = useState<string>();
  const [error, setError] = useState(false);

  useEffect(() => {
    async function f() {
      try {
        const r = await fetch(
          `https://adiffs.osmcha.org/changesets/${changeset.id}.adiff`,
        );
        if (r.status !== 200) throw new Error(r.statusText);
        const xml = await r.text();
        setADiffXML(xml);
      } catch (ex) {
        console.error(ex);
        setError(true);
      }
    }
    f();
  }, [changeset]);

  useEffect(() => {
    if (!aDiffXML) return;

    const map = new maplibre.Map({
      container: containerRef.current!,
      style: OPENSTREETMAP_CARTO_STYLE,
      maxZoom: 22,
      hash: false,
      attributionControl: false, // we're moving this to the other corner
    });
    map.addControl(new maplibre.AttributionControl(), 'bottom-left');

    map.setMaxPitch(0);
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();

    map.on('load', async () => {
      const aDiff = await adiffParser(aDiffXML);
      const adiffViewer = new MapLibreAugmentedDiffViewer(
        {
          ...aDiff,
          note: OPENSTREETMAP_CARTO_STYLE.sources['osm-tiles'].attribution,
        },
        {
          onClick: (_event: maplibre.MapMouseEvent, action: SelectedDiff) =>
            onSelect(action),
          showElements: ['node', 'way', 'relation'],
          showActions: ['create', 'modify', 'delete', 'noop'],
        },
      );
      adiffViewer.addTo(map);
      adiffViewer.refresh();

      const bounds = map.cameraForBounds(adiffViewer.bounds(), {
        padding: 200,
      });
      if (bounds) map.jumpTo(bounds);
    });
  }, [aDiffXML, onSelect]);

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: 'red',
        }}
      >
        Diff not available yet
      </div>
    );
  }
  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
