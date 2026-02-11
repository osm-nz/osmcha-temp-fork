import {
  type Changeset,
  type ListChangesetOptions,
  listChangesets,
} from 'osm-api';

/** will likely emit duplicates */
export async function* fetchPaginatedChangesets(
  from: Date,
  to: Date,
  options: ListChangesetOptions,
  controller: AbortController,
): AsyncGenerator<Changeset[], void, void> {
  const LIMIT = 100;
  const result = await listChangesets(
    {
      ...options,
      time: [from.toISOString(), to.toISOString()],
      limit: LIMIT,
    },
    { signal: controller.signal },
  );
  if (controller.signal.aborted) return;

  yield result;

  // the API doesn't support pagination, so we check if it reached
  // the limit of search results. If so, there must be new data.
  if (result.length === LIMIT) {
    // the API returns newest first, so the next query needs to start
    // from the oldest date in the search results.
    const [oldestDate] = result
      .flatMap((cs) =>
        cs.closed_at
          ? [new Date(cs.created_at), new Date(cs.closed_at)]
          : [new Date(cs.created_at)],
      )
      .toSorted();

    yield* fetchPaginatedChangesets(from, oldestDate!, options, controller);
  }
}
