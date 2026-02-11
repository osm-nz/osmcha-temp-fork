import { QueryBuilder, type RuleGroupType } from 'react-querybuilder';
import { FIELDS } from '../util/query.js';
import {
  type RelativeUnit,
  formatDateForPicker,
  relativeDateToDate,
} from '../util/date.js';
import classes from './FilterPopup.module.css';
import { FilterSummary } from './FilterSummary.js';
import { BBoxChooser } from './BBoxChooser.js';

export interface Query {
  bbox: string;
  from: string;
  to: string;
}

export const DEFAULT_QUERY: Query = {
  bbox: '165.366211,-47.762509,179.384766,-33.545548',
  from: '2,days',
  to: '',
};

export const DEFAULT_FILTER: RuleGroupType = {
  combinator: 'and',
  rules: [
    {
      field: 'changeset._editor',
      operator: 'notIn',
      value: 'StreetComplete,StreetComplete_ee',
    },
  ],
};

export const FilterPopup: React.FC<{
  query: Query;
  setQuery: React.Dispatch<React.SetStateAction<Query>>;
  filter: RuleGroupType;
  setFilter: React.Dispatch<React.SetStateAction<RuleGroupType>>;
  onClose(): void;
  matchCount: number;
  totalCount: number;
}> = ({
  query,
  setQuery,
  filter,
  setFilter,
  onClose,
  matchCount,
  totalCount,
}) => {
  return (
    <dialog ref={(dia) => dia?.showModal()} className={classes.dialog}>
      <h4>Date Range</h4>
      <select
        value={+!!query.to}
        onChange={(event) => {
          if (event.target.value === '0') {
            setQuery((c) => ({ ...c, to: '', from: '3,days' }));
          } else {
            setQuery((c) => ({
              ...c,
              to: formatDateForPicker(new Date()),
              from: formatDateForPicker(relativeDateToDate(c.from)),
            }));
          }
        }}
      >
        <option value={0}>Relative</option>
        <option value={1}>Absolute</option>
      </select>
      {query.to ? (
        <>
          <label>
            {' From '}
            <input
              type="datetime-local"
              value={query.from}
              onChange={(event) =>
                setQuery((c) => ({ ...c, from: event.target.value }))
              }
            />
          </label>
          <label>
            {' to '}
            <input
              type="datetime-local"
              value={query.to}
              onChange={(event) =>
                setQuery((c) => ({ ...c, to: event.target.value }))
              }
            />
          </label>
        </>
      ) : (
        <label>
          {' Last '}
          <input
            type="number"
            value={query.from.split(',')[0]}
            onChange={(event) =>
              setQuery((c) => ({
                ...c,
                from: `${event.target.value},${c.from.split(',')[1]}`,
              }))
            }
            style={{ width: 60 }}
          />
          <select
            value={query.from.split(',')[1]}
            onChange={(event) =>
              setQuery((c) => ({
                ...c,
                from: `${c.from.split(',')[0]},${event.target.value}`,
              }))
            }
          >
            {(
              ['seconds', 'minutes', 'hours', 'days'] satisfies RelativeUnit[]
            ).map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
      )}
      <br />
      <br />
      <h4>Region</h4>
      <input
        type="text"
        value={query.bbox}
        onChange={(event) =>
          setQuery((c) => ({ ...c, bbox: event.target.value }))
        }
        style={{ width: 300 }}
      />
      <BBoxChooser
        value={query.bbox}
        onChange={(newValue) => setQuery((c) => ({ ...c, bbox: newValue }))}
      />
      <br />
      <br />
      <h4>Filter</h4>
      <QueryBuilder
        fields={FIELDS}
        query={filter}
        onQueryChange={setFilter}
        parseNumbers="strict-limited"
        addRuleToNewGroups
        showCombinatorsBetweenRules
        controlClassnames={{ queryBuilder: 'queryBuilder-branches' }}
      />
      <small>
        Matched {matchCount} out of the {totalCount} currently downloaded
        changesets.
      </small>
      <br />
      <h4>Summary</h4>
      <FilterSummary query={query} filter={filter} />
      <br />
      <br />
      <button onClick={onClose}>Close</button>
    </dialog>
  );
};
