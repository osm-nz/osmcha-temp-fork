import { useEffect, useEffectEvent, useState } from 'react';
import type { Changeset } from 'osm-api';
import { apply as jsonLogic } from 'json-logic-js';
import { type RuleGroupType, formatQuery } from 'react-querybuilder';
import { fetchPaginatedChangesets } from './api/fetchPaginatedChangesets.js';
import 'react-querybuilder/dist/query-builder.css';
import './index.css';
import { useUserInfo } from './hooks/useUserInfo.js';
import { uniqBy } from './util/object.js';
import { RenderChangesetListItem } from './components/RenderChangesetListItem.js';
import { MapRenderer, type SelectedDiff } from './components/MapRenderer.js';
import { FilterPopup, type Query } from './components/FilterPopup.js';
import { relativeDateToDate } from './util/date.js';
import { FilterSummary } from './components/FilterSummary.js';
import { convertCsToQuery } from './util/query.js';
import { parseBbox } from './util/geo.js';
import { DiffPopup } from './components/DiffPopup.js';
import { generateQs, parseQs } from './util/qs.js';

const DEFAULTS = parseQs();

export const App: React.FC = () => {
  const [query, setQuery] = useState<Query>(DEFAULTS.query);
  const [filter, setFilter] = useState<RuleGroupType>(DEFAULTS.filter);

  // UI state:
  const [selectedChangeset, setSelectedChangeset] = useState<Changeset>();
  const [selectedDiff, setSelectedDiff] = useState<SelectedDiff>();
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // data:
  const [list, setList] = useState<Changeset[]>();
  const [loading, setLoading] = useState(0); // the page counter, or 0 if not loading
  const [error, setError] = useState<Error>();

  // dervied data:
  const users = useUserInfo(list);

  const jsonLogicExpression = formatQuery(filter, 'jsonlogic');
  const filteredList = list?.filter((cs) => {
    return jsonLogic(jsonLogicExpression, convertCsToQuery(cs, users));
  });

  useEffect(() => {
    window.history.replaceState('', '', `?${generateQs(query, filter)}`);
  }, [filter, query]);

  const search = async (controller: AbortController) => {
    setLoading(1);
    setList([]);
    const generator = fetchPaginatedChangesets(
      query.to ? new Date(query.from) : relativeDateToDate(query.from),
      query.to ? new Date(query.to) : new Date(),
      {
        bbox: parseBbox(query.bbox),
        only: 'closed',
      },
      controller,
    );
    for await (const chunk of generator) {
      setList((c = []) => uniqBy('id', [...c, ...chunk]));
      setLoading((counter) => counter + 1);
    }
    setLoading(0); // done
  };
  const search_stable = useEffectEvent(search);

  useEffect(() => {
    const controller = new AbortController();
    search_stable(controller).catch((ex) =>
      ex instanceof DOMException && ex.name === 'AbortError'
        ? undefined
        : setError(ex),
    );
    return () => controller.abort();
  }, []);

  if (error) {
    return <>Error: {`${error}`}</>;
  }

  return (
    <div style={{ display: 'flex' }}>
      {showFilterPopup && (
        <FilterPopup
          filter={filter}
          setFilter={setFilter}
          query={query}
          setQuery={setQuery}
          onClose={() => setShowFilterPopup(false)}
          matchCount={filteredList?.length ?? 0}
          totalCount={list?.length ?? 0}
        />
      )}
      {!!selectedDiff && (
        <DiffPopup
          diff={selectedDiff}
          onClose={() => setSelectedDiff(undefined)}
        />
      )}
      <div
        style={{
          display: 'flex',
          width: '34%',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <header>
          <span>
            <FilterSummary query={query} filter={filter} />
          </span>
          <div style={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <button onClick={() => setShowFilterPopup(true)}>Edit</button>
            <button onClick={() => search(new AbortController())}>
              Reload
            </button>
          </div>
        </header>
        <header>
          Showing {filteredList?.length ?? 0} of {list?.length ?? 0}.
          {!!loading && <> Loading page {loading}…</>}
        </header>

        {filteredList && (
          <ul
            style={{
              borderRight: '1px solid #ccc',
              overflowY: 'auto',
            }}
          >
            {filteredList.map((changeset) => {
              return (
                <RenderChangesetListItem
                  key={changeset.id}
                  changeset={changeset}
                  user={users[changeset.uid]}
                  isSeletced={selectedChangeset === changeset}
                  setSelected={(cs) => {
                    setSelectedChangeset(cs);
                    setSelectedDiff(undefined);
                  }}
                />
              );
            })}
          </ul>
        )}
      </div>
      <div style={{ width: '66%', height: '100vh' }}>
        {selectedChangeset ? (
          <MapRenderer
            key={selectedChangeset.id}
            changeset={selectedChangeset}
            onSelect={setSelectedDiff}
          />
        ) : (
          <div style={{ margin: 64, textAlign: 'center', color: '#666' }}>
            Select a changeset to get started
          </div>
        )}
      </div>
    </div>
  );
};
