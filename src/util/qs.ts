import { type RuleGroupType, formatQuery } from 'react-querybuilder';
import { parseSQL } from 'react-querybuilder/parseSQL';
import {
  DEFAULT_FILTER,
  DEFAULT_QUERY,
  type Query,
} from '../components/FilterPopup.js';

const SPECIAL_ESCAPES = {
  '%3D': '⩵',
  '%27': '`',
  '%28': '(',
  '%29': ')',
  '%2C': ',',
  '%21': '!',
};
export function prettifyQs(_qs: string) {
  let qs = _qs;
  for (const [k, v] of Object.entries(SPECIAL_ESCAPES)) {
    qs = qs.replaceAll(k, v);
  }
  return qs;
}
export function unprettifyQs(_qs: string) {
  let qs = _qs;
  for (const [v, k] of Object.entries(SPECIAL_ESCAPES)) {
    qs = qs.replaceAll(k, v);
  }
  return qs;
}

interface ForQs extends Partial<Query> {
  filter?: string;
}

const DEFAULTS: ForQs = {
  filter: formatQuery(DEFAULT_FILTER),
  ...DEFAULT_QUERY,
};

export function parseQs() {
  const qs = Object.fromEntries(
    new URLSearchParams(
      unprettifyQs(window.location.search.slice(1)),
    ).entries(),
  );
  const query: Query = DEFAULT_QUERY;
  let filter: RuleGroupType = DEFAULT_FILTER;

  try {
    for (const [k, v] of Object.entries(qs)) {
      if (k === 'filter') {
        filter = parseSQL(v);
      } else if (k in DEFAULT_QUERY) {
        // @ts-expect-error -- hacky hack
        query[k] = v;
      }
    }
  } catch (ex) {
    console.error('parseQs', ex);
  }

  return { query, filter };
}

export function generateQs(query: Query, filter: RuleGroupType) {
  const qs: ForQs = { ...query, filter: formatQuery(filter, 'sql') };

  for (const [k, v] of Object.entries(qs)) {
    if (!v || JSON.stringify(DEFAULTS[k as never]) === JSON.stringify(v)) {
      delete qs[k as never];
    }
  }
  return prettifyQs(new URLSearchParams(qs as never).toString());
}
