import { useEffect, useState } from 'react';
import { get, set } from 'idb-keyval';
import { type Changeset, type OsmUser, getUsers } from 'osm-api';
import { createChunks } from '../util/object.js';

// TODO: are we allowed to cache this info? re GDPR
const KEY = 'osmUserCache';

export interface CachedUserInfo {
  [userId: number]: OsmUser;
}

export async function getCachedUserInfo(requestedUserIds: number[]) {
  const DB = (await get<CachedUserInfo>(KEY)) || {};
  const knownUserIds = new Set(Object.keys(DB).map(Number));

  const missingUsers = new Set(requestedUserIds).difference(knownUserIds);
  if (missingUsers.size) {
    for (const chunk of createChunks([...missingUsers], 100)) {
      const results = await getUsers(chunk);
      for (const result of results) {
        DB[result.id] = result;
      }
    }
    await set(KEY, DB);
  }

  return DB;
}

export function useUserInfo(list: Changeset[] | undefined) {
  const [userInfo, setUserInfo] = useState<CachedUserInfo>({});

  useEffect(() => {
    if (!list) return;
    getCachedUserInfo(list.map((cs) => cs.uid))
      .then(setUserInfo)
      .catch(console.error);
  }, [list]);

  return userInfo;
}
