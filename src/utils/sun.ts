/**
 * Sunrise / sunset calculation using the NOAA algorithm.
 * Returns minutes since midnight in the user's local timezone.
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/** Julian day from a Date (UT). */
function julianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const yr = m <= 2 ? y - 1 : y;
  const mo = m <= 2 ? m + 12 : m;
  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (yr + 4716)) +
    Math.floor(30.6001 * (mo + 1)) +
    d +
    B -
    1524.5
  );
}

/** Julian century from a Date. */
function julianCentury(date: Date): number {
  return (julianDay(date) - 2451545) / 36525;
}

function sunGeomMeanLong(T: number): number {
  let L0 = 280.46646 + T * (36000.76983 + 0.0003032 * T);
  while (L0 > 360) L0 -= 360;
  while (L0 < 0) L0 += 360;
  return L0;
}

function sunGeomMeanAnomaly(T: number): number {
  return 357.52911 + T * (35999.05029 - 0.0001537 * T);
}

function eccentricityEarthOrbit(T: number): number {
  return 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
}

function sunEqOfCenter(T: number): number {
  const M = sunGeomMeanAnomaly(T);
  const mrad = M * RAD;
  return (
    Math.sin(mrad) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * mrad) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * mrad) * 0.000289
  );
}

function sunTrueLong(T: number): number {
  return sunGeomMeanLong(T) + sunEqOfCenter(T);
}

function sunApparentLong(T: number): number {
  const omega = 125.04 - 1934.136 * T;
  return sunTrueLong(T) - 0.00569 - 0.00478 * Math.sin(omega * RAD);
}

function meanObliquityOfEcliptic(T: number): number {
  const seconds = 21.448 - T * (46.815 + T * (0.00059 - T * 0.001813));
  return 23 + 26 + seconds / 60;
}

function obliquityCorrection(T: number): number {
  const omega = 125.04 - 1934.136 * T;
  return meanObliquityOfEcliptic(T) + 0.00256 * Math.cos(omega * RAD);
}

function sunDeclination(T: number): number {
  const e = obliquityCorrection(T);
  const lambda = sunApparentLong(T);
  return Math.asin(Math.sin(e * RAD) * Math.sin(lambda * RAD)) * DEG;
}

function equationOfTime(T: number): number {
  const epsilon = obliquityCorrection(T);
  const l0 = sunGeomMeanLong(T);
  const e = eccentricityEarthOrbit(T);
  const m = sunGeomMeanAnomaly(T);

  let y = Math.tan((epsilon * RAD) / 2);
  y *= y;

  const sin2l0 = Math.sin(2 * l0 * RAD);
  const sinm = Math.sin(m * RAD);
  const cos2l0 = Math.cos(2 * l0 * RAD);
  const sin4l0 = Math.sin(4 * l0 * RAD);
  const sin2m = Math.sin(2 * m * RAD);

  const Etime =
    y * sin2l0 -
    2 * e * sinm +
    4 * e * y * sinm * cos2l0 -
    0.5 * y * y * sin4l0 -
    1.25 * e * e * sin2m;

  return Etime * DEG * 4; // minutes
}

function hourAngleSunrise(lat: number, declination: number): number {
  const latRad = lat * RAD;
  const sdRad = declination * RAD;
  const HA =
    Math.acos(
      Math.cos(90.833 * RAD) / (Math.cos(latRad) * Math.cos(sdRad)) -
        Math.tan(latRad) * Math.tan(sdRad),
    ) * DEG;
  return HA;
}

interface SunTimes {
  sunrise: number; // minutes since midnight local
  sunset: number;
}

/**
 * Calculate sunrise and sunset for a given date and location.
 * @param date  The date to calculate for
 * @param lat   Latitude in decimal degrees
 * @param lng   Longitude in decimal degrees (positive = east)
 * @returns Object with sunrise and sunset as minutes since midnight local time
 */
export function getSunTimes(date: Date, lat: number, lng: number): SunTimes {
  const T = julianCentury(date);
  const eqTime = equationOfTime(T);
  const declination = sunDeclination(T);
  const HA = hourAngleSunrise(lat, declination);

  // Solar noon in minutes from midnight UTC
  const solarNoonUTC = 720 - 4 * lng - eqTime;
  // Sunrise/sunset in minutes from midnight UTC
  const sunriseUTC = solarNoonUTC - HA * 4;
  const sunsetUTC = solarNoonUTC + HA * 4;

  // Convert UTC minutes to local minutes by adding the timezone offset
  const tzOffset = -date.getTimezoneOffset(); // minutes east of UTC

  const sunrise = sunriseUTC + tzOffset;
  const sunset = sunsetUTC + tzOffset;

  return { sunrise, sunset };
}

/** Check if the current time is between sunset and next sunrise (night). */
export function isCurrentlyNight(lat: number, lng: number): boolean {
  const now = new Date();
  const { sunrise, sunset } = getSunTimes(now, lat, lng);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // After sunset or before sunrise = night
  if (currentMinutes >= sunset || currentMinutes < sunrise) {
    return true;
  }
  return false;
}
