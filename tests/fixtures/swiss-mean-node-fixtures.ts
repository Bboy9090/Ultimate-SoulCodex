export interface SwissMeanNodeFixture {
  id: string;
  inputTimestamp: string;
  expectedNorthNodeLongitude: number;
}

export const SWISS_MEAN_NODE_FIXTURES: readonly SwissMeanNodeFixture[] = [
  ["bobby-bronx","1990-09-17T15:11:00Z",304.713607667540],
  ["nyc-dst-spring","2024-03-10T07:30:00Z",17.206851588052],
  ["nyc-dst-fall","2024-11-03T05:30:00Z",4.608611931680],
  ["london-summer","2001-06-21T11:00:00Z",96.605777549133],
  ["london-winter","1985-12-21T23:45:00Z",36.350909718900],
  ["sydney-summer","1999-01-14T19:20:00Z",143.665435706635],
  ["sydney-winter","2010-07-01T08:05:00Z",282.033242724172],
  ["tokyo","1975-04-03T05:32:00Z",243.712281013936],
  ["san-juan","1991-04-23T12:15:00Z",293.176329251414],
  ["cape-town","1968-08-09T20:40:00Z",12.245875925670],
  ["delhi-leap-day","2000-02-29T00:15:00Z",121.942330965563],
  ["kathmandu-quarter-hour-zone","2020-02-29T11:27:00Z",95.089692923770],
  ["adelaide-half-hour-zone","1988-10-28T21:00:00Z",341.183094653592],
  ["honolulu","1944-06-06T13:30:00Z",119.840061218016],
  ["anchorage-high-latitude","2015-09-23T08:15:00Z",180.886457382710],
  ["reykjavik-high-latitude","1950-03-20T13:00:00Z",7.953497204945],
  ["buenos-aires-year-edge","2009-01-01T01:59:00Z",310.958367764624],
  ["nairobi-equatorial","1993-07-26T06:00:00Z",249.503892494630],
  ["apia-date-line","2011-12-31T10:10:00Z",253.009907286197],
  ["kiritimati-utc-plus-14","2026-08-03T09:28:00Z",330.818794853890],
  ["pago-pago-utc-minus-11","2026-08-04T10:28:00Z",330.763609924345],
  ["berlin-1900","1900-01-01T11:00:00Z",259.137058299554],
  ["cairo-1850","1850-05-15T07:24:51Z",139.085050263803],
  ["los-angeles-2100","2100-01-01T05:45:00Z",350.924957481135],
].map(([id,inputTimestamp,expectedNorthNodeLongitude]) => ({
  id: id as string,
  inputTimestamp: inputTimestamp as string,
  expectedNorthNodeLongitude: expectedNorthNodeLongitude as number,
}));

export const SWISS_MEAN_NODE_REFERENCE = Object.freeze({
  engine: "Swiss Ephemeris 2.10.03 / pyswisseph 20230604",
  body: "MEAN_NODE",
  zodiac: "tropical",
  fixtureCount: SWISS_MEAN_NODE_FIXTURES.length,
});
