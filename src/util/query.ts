import type { Changeset } from 'osm-api';
import type { Field } from 'react-querybuilder';
import type { CachedUserInfo } from '../hooks/useUserInfo.js';

interface ChangesetForQuery {
  'user.display_name': string;
  'user.id': number;
  'user.account_created': Date;
  'user.changesets.count': number;
  'user.blocks.received.count': number;
  'user.blocks.received.active': number;
  'user.roles': string[];

  'changeset.id': number;
  'changeset._editor': string;
  'changeset.comments_count': number;
  'changeset.changes_count': number;
  'changeset.open': boolean;

  'changeset.tags._raw': string;
  'changeset.tags._keys': string[];
  // special support for the most common tags, can use the raw query for the rest
  'changeset.tags.changesets_count': string;
  'changeset.tags.comment': string;
  'changeset.tags.created_by': string;
  'changeset.tags.host': string;
  'changeset.tags.imagery_used': string;
  'changeset.tags.locale': string;
  'changeset.tags.source': string;
  'changeset.tags.hashtags': string;

  // TODO: warnings count
  // TODO: closed notes
}

export const FIELDS: Field<keyof ChangesetForQuery>[] = [
  { name: 'user.display_name', label: 'Username' },
  { name: 'user.id', label: 'User ID', inputType: 'number' },
  { name: 'user.account_created', label: 'Account Created', inputType: 'date' },
  {
    name: 'user.roles',
    label: 'User Roles',
    valueEditorType: 'select',
    values: [
      { value: 'importer', label: 'Importer' },
      { value: 'moderator', label: 'DWG' },
    ],
  },
  {
    name: 'user.changesets.count',
    label: 'Total number of changesets by this user',
    inputType: 'number',
  },
  {
    name: 'user.blocks.received.count',
    label: 'Number of times the user was blocked',
    inputType: 'number',
  },
  {
    name: 'user.blocks.received.active',
    label: 'Number of active user blocks',
    inputType: 'number',
  },
  { name: 'changeset.id', label: 'Changeset ID', inputType: 'number' },
  {
    name: 'changeset._editor',
    label: 'Editor Software',
    placeholder: 'e.g. StreetComplete',
  },
  {
    name: 'changeset.tags._raw',
    label: 'Tags (raw value)',
    placeholder: 'a=b&c=d',
  },
  {
    name: 'changeset.tags._keys',
    label: 'Contains changeset tags',
    placeholder: 'imagery_used,hashtags',
  },
  {
    name: 'changeset.tags.changesets_count',
    label: 'tags.changesets_count',
    inputType: 'number',
  },
  {
    name: 'changeset.tags.comment',
    label: 'tags.changesets_count',
    inputType: 'number',
  },
  {
    name: 'changeset.tags.created_by',
    label: 'tags.changesets_count',
    inputType: 'number',
  },
  {
    name: 'changeset.tags.host',
    label: 'tags.changesets_count',
    inputType: 'number',
  },
  {
    name: 'changeset.tags.imagery_used',
    label: 'tags.changesets_count',
    inputType: 'number',
  },
  {
    name: 'changeset.tags.locale',
    label: 'tags.changesets_count',
    inputType: 'number',
  },
  {
    name: 'changeset.tags.source',
    label: 'tags.changesets_count',
    inputType: 'number',
  },
  {
    name: 'changeset.tags.hashtags',
    label: 'tags.changesets_count',
    inputType: 'number',
  },
];

export function getEditor(cs: Changeset) {
  return cs.tags.created_by?.split(' ')[0] || '';
}

export function convertCsToQuery(cs: Changeset, users: CachedUserInfo) {
  const userInfo = users[cs.uid];
  return {
    user: {
      ...userInfo,
      display_name: cs.user,
      id: cs.id,
    },
    changeset: {
      ...cs,
      _editor: getEditor(cs),
      tags: {
        ...cs.tags,
        _raw: new URLSearchParams(cs.tags).toString(),
        _keys: Object.keys(cs.tags),
      },
    },
  } as never as ChangesetForQuery; // lie
}
