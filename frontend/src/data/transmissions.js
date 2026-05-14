export const TRANSMISSIONS = {
  'General Procedures': [
    { id: 'radio-check', title: 'Radio Check', pilot: '[Station] [Callsign] RADIO CHECK [frequency]', atc: '[Callsign] READING YOU [readability 1-5]', standard: '[Callsign] RADIO CHECK [frequency] — state readability 1 to 5' },
    { id: 'request-time', title: 'Request Time Check', pilot: '[Station] [Callsign] REQUEST TIME CHECK', atc: '[Callsign] TIME [HHMM] Z', standard: '[Callsign] REQUEST TIME CHECK — reply: "TIME [HHMM]Z"' },
    { id: 'speak-slower', title: 'Speak Slower', pilot: '[Station] [Callsign] SPEAK SLOWER', atc: '[Callsign] ROGER, SPEAK SLOWER', standard: 'Use phrase "SPEAK SLOWER" to request reduced speech rate' },
    { id: 'say-again', title: 'Say Again', pilot: '[Station] [Callsign] SAY AGAIN [which part]', atc: '[Callsign] SAY AGAIN [message]', standard: 'Use "SAY AGAIN" to request repetition; specify which portion' },
    { id: 'request-words-twice', title: 'Request Words Twice', pilot: '[Station] [Callsign] REQUEST WORDS TWICE', atc: '[Callsign] SAY AGAIN WORDS TWICE', standard: 'Use "SAY AGAIN WORDS TWICE" when clarity of words is needed' },
    { id: 'readback-clearance', title: 'Read-Back of Clearance', pilot: '[Callsign] READBACK: [clearance content]', atc: '[Callsign] READBACK CORRECT', standard: 'Read back full clearance using CRAFT: Clearance, Route, Altitude, Frequency, Transponder' },
    { id: 'unable-to-comply', title: 'Unable to Comply', pilot: '[Station] [Callsign] UNABLE [instruction part]', atc: '[Callsign] ROGER, AMENDMENT ...', standard: 'State "UNABLE" and provide a brief reason and alternative if available' },
    { id: 'broadcast-all', title: 'Broadcast to All Stations', pilot: 'ALL STATIONS [message]', atc: '', standard: 'Use broadcast format for urgent information to all stations' },
    { id: 'file-airborne', title: 'File Airborne Flight Plan', pilot: '[Station] [Callsign] FILE AIRBORNE FLIGHT PLAN [details]', atc: 'ROGER, FLIGHT PLAN RECEIVED', standard: 'Provide full flight plan information when filing airborne' },
    { id: 'cancel-ifr', title: 'Cancel IFR Flight / Change to VFR', pilot: '[Station] [Callsign] REQUEST CANCEL IFR / CHANGE TO VFR', atc: 'CALLSIGN, IFR CANCELLED, CONTACT TOWER', standard: 'State clearly: "REQUEST CANCEL IFR" or "REQUEST VFR" and confirm acceptance' }
  ],

  'Pre-Departure & Ground': [
    { id:'req-dep-info', title: 'Request Departure Information', pilot: '[Station] [Callsign] REQUEST DEPARTURE INFORMATION', atc: '[Callsign] RUNWAY [nn], QNH [xxxx], TEMPERATURE [xx]', standard: 'CALLSIGN REQUEST DEPARTURE INFORMATION — readback runway, QNH' },
    { id:'req-startup', title:'Request Start-Up', pilot:'[Station] [Callsign] REQUEST STARTUP AND PUSHBACK', atc:'[Callsign] STARTUP APPROVED, PUSH AND START, FACE [dir]', standard:'CALLSIGN, start-up approved, push and start, face [direction]'},
    { id:'req-pushback', title:'Request Push-Back', pilot:'[Station] [Callsign] REQUEST PUSHBACK', atc:'PUSHBACK APPROVED, CONTACT TOWER WHEN READY', standard:'REQUEST PUSHBACK — include stand number'},
    { id:'req-taxi-departure', title:'Request Taxi For Departure', pilot:'[Station] [Callsign] READY TO TAXI RUNWAY [nn]', atc:'TAXI VIA [route], HOLD SHORT RUNWAY [nn]', standard:'TAXI readback including taxiways and hold-short point'},
    { id:'req-backtrack', title:'Request Backtrack', pilot:'[Station] [Callsign] REQUEST BACKTRACK RUNWAY [nn]', atc:'BACKTRACK APPROVED, REMAIN ON RUNWAY', standard:'Request backtrack with reason if required'}
  ],

  'Departure': [
    { id:'request-atc', title:'Requesting ATC / IFR Clearance', pilot:'[Station] [Callsign] REQUEST ATC CLEARANCE TO [DESTINATION]', atc:'[Callsign] CLEARED TO [destination] VIA [SID], SQUAWK [code], CLIMB [alt]', standard:'CRAFT clearance readback required'},
    { id:'report-ready', title:'Report Ready for Departure', pilot:'[Station] [Callsign] READY FOR DEPARTURE', atc:'[Callsign] LINE UP AND WAIT / CLEARED FOR TAKEOFF', standard:'Report ready and readback clearance'},
    { id:'ack-lineup', title:'Acknowledge Line Up and Wait', pilot:'LINE UP AND WAIT, [Callsign]', atc:'ROGER', standard:'Readback "LINE UP AND WAIT" exactly'}
  ],

  'En Route': [
    { id:'initial-contact', title:'Initial Contact with Area Control', pilot:'[Station] [Callsign] [level] ESTIMATING [fix] AT [time]', atc:'[Callsign] RADAR CONTACT, CLIMB/MAINTAIN [level]', standard:'Provide level and estimate when contacting area control'},
    { id:'position-report', title:'Position Report (Compulsory)', pilot:'[Station] [Callsign] POSITION [fix] ETA [time] ALT [alt]', atc:'ROGER', standard:'Standard position report format: position, ETA, level, next point'},
    { id:'request-descent', title:'Request Descent', pilot:'[Station] [Callsign] REQUEST DESCENT TO [alt]', atc:'[Callsign] DESCEND TO [alt] EXPECT [procedure]', standard:'Request and readback descent clearance'}
  ],

  'Arrival & Approach': [
    { id:'initial-contact-arrival', title:'Initial Contact — IFR Arrival', pilot:'[Approach] [Callsign] [FLxxx] ESTIMATING [fix] [time] INFORMATION [ATIS]', atc:'[Callsign] DESCEND [xx], EXPECT ILS RUNWAY [nn]', standard:'Provide ATIS code, level and estimate on initial contact'},
    { id:'request-holding', title:'Request Holding Instructions', pilot:'[Station] [Callsign] REQUEST HOLDING AT [fix]', atc:'[Callsign] HOLD AT [fix], INBOUND [heading], RIGHT TURNS', standard:'Include inbound track, direction of turns and leg time'}
  ],

  'Meteorological': [
    { id:'request-atis', title:'Request ATIS / Weather', pilot:'[Station] [Callsign] REQUEST ATIS', atc:'[Callsign] INFORMATION [letter], METAR [data]', standard:'Obtain ATIS and state the letter on contact'},
    { id:'advise-weather', title:'Advise Weather Ahead', pilot:'[Station] [Callsign] WEATHER AHEAD [describe]', atc:'ROGER, ADVISE INTENTIONS', standard:'Report weather and request assistance if needed'}
  ],

  'Emergency & Abnormal': [
    { id:'mayday', title:'Distress — MAYDAY Call', pilot:'MAYDAY MAYDAY MAYDAY, [ATC], [Callsign], [nature], [souls], [fuel], [position], [altitude], [intentions]', atc:'[Callsign] ROGER MAYDAY, SQUAWK 7700, EMERGENCY SERVICES ALERTED', standard:'See MAYDAY format — include souls, fuel, position, intentions'},
    { id:'panpan', title:'Urgency — PAN PAN Call', pilot:'PAN PAN PAN, [ATC], [Callsign], [nature], [position], [intentions]', atc:'[Callsign] ROGER PAN PAN, ADVISE INTENTIONS', standard:'PAN PAN for urgent but not immediate danger'},
    { id:'radio-fail', title:'Transmitting Blind (Communications Failure)', pilot:'[Callsign] TRANSMITTING BLIND, LAST CONTACT [freq]', atc:'[Callsign] ROGER, FOLLOW LOST COMMUNICATION PROCEDURES', standard:'Squawk 7600 and follow lost com procedures'}
  ]
}
