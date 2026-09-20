export interface SwissEqualHouseFixture {
  id: string;
  inputTimestamp: string;
  latitude: number;
  longitude: number;
  expectedAscendantLongitude: number;
  expectedMidheavenLongitude: number;
}

export const SWISS_EQUAL_HOUSE_FIXTURES: readonly SwissEqualHouseFixture[] = [
  ["bobby-bronx","1990-09-17T15:11:00Z",40.8448,-73.8648,227.31408766862108,148.0042533980309],
  ["nyc-dst-spring","2024-03-10T07:30:00Z",40.7128,-74.006,274.7279361901917,209.0069833298225],
  ["nyc-dst-fall","2024-11-03T05:30:00Z",40.7128,-74.006,149.55568893784755,53.84418785581558],
  ["london-summer","2001-06-21T11:00:00Z",51.5074,-0.1278,169.1299175340377,75.79873791219298],
  ["london-winter","1985-12-21T23:45:00Z",51.5074,-0.1278,177.60590967525508,86.8853022806056],
  ["sydney-summer","1999-01-14T19:20:00Z",-33.8688,151.2093,297.59167440732267,196.3025185950625],
  ["sydney-winter","2010-07-01T08:05:00Z",-33.8688,151.2093,294.85666317955776,192.75768439398513],
  ["tokyo","1975-04-03T05:32:00Z",35.6762,139.6503,149.894830877575,55.90824385837556],
  ["san-juan","1991-04-23T12:15:00Z",18.4655,-66.1057,68.07064246509042,326.4555537282647],
  ["cape-town","1968-08-09T20:40:00Z",-33.9249,18.4241,14.174889081226464,285.50252045106134],
  ["delhi-leap-day","2000-02-29T00:15:00Z",28.6139,77.209,317.9801457464922,241.2158083885082],
  ["kathmandu-quarter-hour-zone","2020-02-29T11:27:00Z",27.7172,85.324,149.8660971326862,58.069623978299056],
  ["adelaide-half-hour-zone","1988-10-28T21:00:00Z",-34.9285,138.6007,237.7329318932005,128.5926124925173],
  ["honolulu","1944-06-06T13:30:00Z",21.3069,-157.8583,37.40256244162674,297.40876639713684],
  ["anchorage-high-latitude","2015-09-23T08:15:00Z",61.2181,-149.9003,110.81984409579762,333.81341447060976],
  ["reykjavik-high-latitude","1950-03-20T13:00:00Z",64.1466,-21.9426,124.20570841646736,349.7134568533562],
  ["buenos-aires-year-edge","2009-01-01T01:59:00Z",-34.6037,-58.3816,153.0099998390056,73.61414922829034],
  ["nairobi-equatorial","1993-07-26T06:00:00Z",-1.2921,36.8219,158.98356757680506,72.25248710747753],
  ["apia-date-line","2011-12-31T10:10:00Z",-13.8507,-171.7514,168.13066678596334,81.03617489897839],
  ["kiritimati-utc-plus-14","2026-08-03T09:28:00Z",1.8721,-157.4278,28.961834270217494,294.63138794613207],
  ["pago-pago-utc-minus-11","2026-08-04T10:28:00Z",-14.2756,-170.702,28.50520515038012,297.24763342232484],
  ["berlin-1900","1900-01-01T11:00:00Z",52.52,13.405,22.110473283725938,278.3088044367247],
  ["cairo-1850","1850-05-15T07:24:51Z",30.0444,31.2357,115.93471319730247,16.409851712105286],
  ["los-angeles-2100","2100-01-01T05:45:00Z",34.0522,-118.2437,162.3196379825262,70.5790378964382],
].map(([id,inputTimestamp,latitude,longitude,expectedAscendantLongitude,expectedMidheavenLongitude]) => ({
  id: id as string,
  inputTimestamp: inputTimestamp as string,
  latitude: latitude as number,
  longitude: longitude as number,
  expectedAscendantLongitude: expectedAscendantLongitude as number,
  expectedMidheavenLongitude: expectedMidheavenLongitude as number,
}));

export const SWISS_EQUAL_HOUSE_REFERENCE = Object.freeze({
  engine: "Swiss Ephemeris 2.10.03 / pyswisseph 20230604",
  function: "swe_houses_ex",
  zodiac: "tropical",
  houseSystem: "E",
  longitudeConvention: "east-positive",
  fixtureCount: SWISS_EQUAL_HOUSE_FIXTURES.length,
});
