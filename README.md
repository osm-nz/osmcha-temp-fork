This is a temporary fork of OSMCha, to work around [performance issues which make OSMCha unusable](https://osmus.slack.com/archives/C04Q8R2G17E/p1768654274890469?thread_ts=1757413003.963779&cid=C04Q8R2G17E) if your bbox is is enourmous (for example, an entire country).

This fork is about 5x–10x faster for certain use-cases, since it uses [the official list-changesets API](https://github.com/osmlab/osm-api-js/blob/main/examples/listChangesets.md), instead of OSMCha's own API.

You can access the tool [from here](http://osm-nz.github.io/osmcha-temp-fork).

This will eventually be shutdown, once the equivalent performance optimisations can be incorporated into OSMCha.
