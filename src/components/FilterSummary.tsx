import { type RuleGroupType, formatQuery } from 'react-querybuilder';
import TimeAgo from 'react-timeago-i18n';
import { feature } from '@rapideditor/country-coder';
import { FIELDS } from '../util/query.js';
import { parseBbox } from '../util/geo.js';
import type { Query } from './FilterPopup.js';

export const FilterSummary: React.FC<{
  filter: RuleGroupType;
  query: Query;
}> = ({ filter, query }) => {
  const date = query.to ? (
    <>
      From <TimeAgo date={query.from} /> to{' '}
      <TimeAgo
        date={query.to}
        hideSeconds
        hideSecondsText={['just now', 'right now']}
      />
    </>
  ) : (
    `Last ${query.from.split(',').join(' ')}`
  );

  const [minLon, minLat, maxLon, maxLat] = parseBbox(query.bbox);
  const lon = minLon + (maxLon - minLon) / 2;
  const lat = minLat + (maxLat - minLat) / 2;
  const regionInfo = feature([lon, lat]);

  const region = regionInfo
    ? ` in ${regionInfo.properties.nameEn} ${regionInfo.properties.emojiFlag}.`
    : ' in an unknown region.';

  const filterString = formatQuery(filter, {
    format: 'natural_language',
    fields: FIELDS,
  });

  return (
    <small>
      {date}
      {region} {filterString === '1 is 1' ? '' : `${filterString}.`}
    </small>
  );
};
