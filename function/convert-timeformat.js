const serialOffset = 25569; // serial(1900/01/01) vs UNIX(1970/01/01)
const coeffH = 24;    // hour
const coeffM = 60;    // minute
const coeffS = 60;    // second
const coeffMS = 1000; // ms
const diffJST = 9 * coeffH * coeffM * coeffS * coeffMS;

// serial time => ms
const serialTime2ms = (serialTime) => {
  // minute level round
  const minuteDisplay = Math.round(serialTime * coeffH * coeffM);
  return minuteDisplay * coeffS * coeffMS;
}

// serial date => ms
const serialDate2ms = (serialDate) => {
  return (serialDate - serialOffset) * coeffH * coeffM * coeffS * coeffMS;
}

// serial date / serial time => ms
const serial2msDate = (serialDate, serialTime) => {
  const msDate = serialDate2ms(serialDate);
  const msTime = serialTime2ms(serialTime);
  return msDate + msTime;
}

// serial date & time => ISOString
const serial2ISOString = (serialDate, serialTime) => {
  const date = new Date(serial2msDate(serialDate, serialTime));
  // yyyy-MM-ddThh:mm:ss.000Z
  return date.toISOString().split('.')[0];
}

// ms => UNIX time
const ms2unix = (ms) => {
  return Math.floor(ms / coeffMS);
}

// UNIX time => ms
const unix2ms = (unix) => {
  return unix * coeffMS;
}

// UNIX timestamp
const getUnixTimestamp =  (unix) => {
const date = new Date();
return ms2unix(date,getTime());
}

// format UNIX time for table
const unix4tableDate = (unix) => {
  const ms = unix2ms(unix);
  const dateJp = new Date(ms + diffJST);
  const isoStr = dateJp.toISOString();
  return String(isoStr.split('.')[0]).replace('T', ' ').replace(/-/g, '/');
}

// yyyy-MM-ddThh:mm:ss => object
const parseISOString = (ISOString) => {
  const [yyyymmddHyphen, hhmmssColon] = ISOString.split('T').map(str => str);
  const yyyymmddSlash = yyyymmddHyphen.replace(/-/g, '/');
  const [hh, mm, ss] = hhmmssColon.split(':').map(str => str);

  const isoObj = {
    date: yyyymmddSlash,
    hour: hh,
    minute: mm,
    second: ss
  };

  return isoObj;
}

// hh:mm => serial time
const timeStr2serialTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(num => Number(num));
  const serialTime = hours / coeffH + minutes / coeffH / coeffM;
  return serialTime;
}

module.exports = {
  serialTime2ms,
  serialDate2ms,
  serial2msDate,
  serial2ISOString,
  ms2unix,
  getUnixTimestamp,
  unix4tableDate,
  parseISOString,
  timeStr2serialTime
};