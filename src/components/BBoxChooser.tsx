import { useEffect, useEffectEvent, useRef } from 'react';
import maplibre from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import type { BBox } from 'osm-api';
import { parseBbox } from '../util/geo.js';
import { OPENSTREETMAP_CARTO_STYLE } from './MapRenderer.js';

export const BBoxChooser: React.FC<{
  value: string;
  onChange(value: string): void;
}> = ({ value, onChange }) => {
  const init = parseBbox(value);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibre.Map>(null);

  function setup() {
    const map = new maplibre.Map({
      container: containerRef.current!,
      style: OPENSTREETMAP_CARTO_STYLE,
      hash: false,
      attributionControl: false,
    });
    mapRef.current = map;

    map.setMaxPitch(0);
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();

    const canvas = map.getCanvasContainer();

    const points = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [init[0], init[1]] },
          properties: { id: 'topLeft' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [init[2], init[3]] },
          properties: { id: 'bottomRight' },
        },
      ],
    } satisfies FeatureCollection;

    function getBbox(): BBox {
      // in case the points are crossed over
      const [lon1, lat1] = points.features[0]!.geometry.coordinates;
      const [lon2, lat2] = points.features[1]!.geometry.coordinates;
      return [
        +Math.min(lon1!, lon2!).toFixed(4),
        +Math.min(lat1!, lat2!).toFixed(4),
        +Math.max(lon1!, lon2!).toFixed(4),
        +Math.max(lat1!, lat2!).toFixed(4),
      ];
    }

    function createPolygon(): FeatureCollection {
      const [minLon, minLat, maxLon, maxLat] = getBbox();
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [minLon, minLat],
                  [maxLon, minLat],
                  [maxLon, maxLat],
                  [minLon, maxLat],
                  [minLon, minLat],
                ],
              ],
            },
            properties: {},
          },
        ],
      };
    }

    let selected: maplibre.MapGeoJSONFeature | undefined;
    function onMove(event: maplibre.MapMouseEvent) {
      if (!selected) return;
      const coords = event.lngLat;

      // Set a UI indicator for dragging.
      canvas.style.cursor = 'grabbing';

      const feature = points.features.find(
        (f) => f.properties.id === selected?.properties.id,
      );
      if (!feature) return;
      feature.geometry.coordinates = [coords.lng, coords.lat];
      map.getSource<maplibre.GeoJSONSource>('point')!.setData(points);
      map
        .getSource<maplibre.GeoJSONSource>('polygon')!
        .setData(createPolygon());
    }

    function onUp() {
      canvas.style.cursor = '';
      map.off('mousemove', onMove);
      map.off('touchmove', onMove);
      onChange(getBbox().join(','));
    }

    map.on('load', async () => {
      map.addSource('point', { type: 'geojson', data: points });
      map.addLayer({
        id: 'point',
        type: 'circle',
        source: 'point',
        paint: { 'circle-radius': 10, 'circle-color': '#3887be' },
      });

      map.addSource('polygon', { type: 'geojson', data: createPolygon() });
      map.addLayer({
        id: 'polygon',
        type: 'line',
        source: 'polygon',
        layout: {},
        paint: { 'line-color': '#3887be' },
      });

      map.fitBounds(
        [
          [init[0], init[1]],
          [init[2], init[3]],
        ],
        { padding: 50, duration: 0 },
      );

      map.on('mouseenter', 'point', () => {
        map.setPaintProperty('point', 'circle-color', '#3bb2d0');
        canvas.style.cursor = 'move';
      });
      map.on('mouseleave', 'point', () => {
        map.setPaintProperty('point', 'circle-color', '#3887be');
        canvas.style.cursor = '';
      });
      map.on('mousedown', 'point', (event) => {
        event.preventDefault(); // Prevent the default map drag behavior.

        canvas.style.cursor = 'grab';

        const [feature] = map.queryRenderedFeatures(event.point);
        if (feature?.properties.id) selected = feature;
        map.on('mousemove', onMove);
        map.once('mouseup', onUp);
      });
    });
  }
  const setup_stable = useEffectEvent(setup);
  useEffect(() => setup_stable(), []);

  return <div ref={containerRef} style={{ width: '200px', height: '200px' }} />;
};
