import { useMemo } from 'react';
import TimeAgo from 'react-timeago-i18n';
import classes from './DiffPopup.module.css';
import type { SelectedDiff } from './MapRenderer.js';
import { MaybeLink } from './MaybeLink.js';

const EMPTY_CELL = <td>&nbsp;</td>;

export const DiffPopup: React.FC<{
  diff: SelectedDiff;
  onClose(): void;
}> = ({ diff, onClose }) => {
  const { old, new: nēw } = diff;

  const allKeys = useMemo(() => {
    const keys = new Set([
      ...Object.keys(old?.tags || {}),
      ...Object.keys(nēw?.tags || {}),
    ]);

    // sort alphabetically
    return [...keys].toSorted((a, b) => a.localeCompare(b));
  }, [old, nēw]);

  return (
    <aside className={classes.DiffPopup}>
      <button onClick={onClose} style={{ marginBottom: 8 }}>
        Close
      </button>

      <table className={classes.DiffTable}>
        <thead>
          <tr>
            <th />
            <th>Before</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>version</td>
            <td>{old?.version || ''}</td>
            <td>{nēw?.version || ''}</td>
          </tr>
          <tr>
            <td>timestamp</td>
            {old ? (
              <td>
                <abbr title={old?.timestamp || ''}>
                  <TimeAgo date={old?.timestamp} />
                </abbr>
              </td>
            ) : (
              EMPTY_CELL
            )}
            {nēw ? (
              <td>
                <abbr title={nēw?.timestamp || ''}>
                  <TimeAgo date={nēw?.timestamp} />
                </abbr>
              </td>
            ) : (
              EMPTY_CELL
            )}
          </tr>
          <tr>
            <td>changeset</td>
            {old ? (
              <td>
                <a
                  href={`https://osm.org/changeset/${old.changeset}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {old.changeset}
                </a>
              </td>
            ) : (
              EMPTY_CELL
            )}
            {nēw ? (
              <td>
                <a
                  href={`https://osm.org/changeset/${nēw?.changeset}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {nēw?.changeset}
                </a>
              </td>
            ) : (
              EMPTY_CELL
            )}
          </tr>
          <tr>
            <td>user</td>
            {old ? (
              <td>
                <a
                  href={`https://osm.org/user/${old.user}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {old.user}
                </a>
              </td>
            ) : (
              EMPTY_CELL
            )}
            {nēw ? (
              <td>
                <a
                  href={`https://osm.org/user/${nēw.user}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {nēw.user}
                </a>
              </td>
            ) : (
              EMPTY_CELL
            )}
          </tr>
          <tr>
            <th colSpan={3}>Tags</th>
          </tr>
          {allKeys.map((key) => {
            const oldValue = old?.tags?.[key] || '';
            const newValue = nēw?.tags?.[key] || '';

            const colour = oldValue
              ? newValue
                ? oldValue === newValue
                  ? '' // unchanged
                  : classes.changedNew
                : classes.removed
              : classes.added;

            const formatter = undefined; // tag2link?.get(key);

            return (
              <tr key={key}>
                <td>{key}</td>
                <td
                  className={
                    colour === classes.changedNew ? classes.changedOld : ''
                  }
                >
                  <MaybeLink value={oldValue} formatter={formatter} />
                </td>
                <td className={colour}>
                  <MaybeLink value={newValue} formatter={formatter} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </aside>
  );
};
