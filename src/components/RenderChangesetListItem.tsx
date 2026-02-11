import { memo } from 'react';
import type { Changeset, OsmUser } from 'osm-api';
import TimeAgo from 'react-timeago-i18n';
import emptyProfilePic from '../assets/empty-profile-pic.png?url';
import { ColourCount } from './ColourCount.js';

export const RenderChangesetListItem = memo<{
  changeset: Changeset;
  user: OsmUser | undefined;
  isSeletced: boolean;
  setSelected: React.Dispatch<React.SetStateAction<Changeset | undefined>>;
}>(({ changeset, user, isSeletced, setSelected }) => {
  const editCount =
    user?.changesets.count || +(changeset.tags.changesets_count || 0);

  return (
    <li key={changeset.id}>
      <a
        href={`#${changeset.id}`}
        style={{
          borderBottom: '1px solid #ccc',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          textDecoration: 'none',
          color: 'initial',
          background: isSeletced ? '#1e90ff22' : '',
        }}
        onClick={() => setSelected(changeset)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#000c',
              display: 'flex',
              gap: 8,
            }}
          >
            <img
              src={user?.img?.href || emptyProfilePic}
              alt="profile pic"
              style={{ height: 20, width: 20, borderRadius: 4 }}
            />
            {changeset.user}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {changeset.closed_at && <TimeAgo date={changeset.closed_at} />}
          </div>
        </div>
        <div style={{ margin: '6px 0', fontSize: 15, color: '#000c' }}>
          {changeset.tags.comment}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {!!changeset.comments_count && '💬'}
            {!!user?.blocks.received.active && '🚫Blocked'}
            {!!user?.blocks.received.count &&
              !user?.blocks.received.active &&
              '⚠️Previously Blocked'}
            {!!user?.roles.includes('moderator') ||
              (!!user?.roles.includes('administrator') && '✅DWG')}
            {!!user?.roles.includes('importer') && '🤖Importer'}
            {editCount < 100 && '🆕'}
          </div>
          <ColourCount
            add={changeset.created_count}
            modify={changeset.modified_count}
            remove={changeset.deleted_count}
          />
        </div>
      </a>
    </li>
  );
});
RenderChangesetListItem.displayName = 'RenderChangesetListItem';
