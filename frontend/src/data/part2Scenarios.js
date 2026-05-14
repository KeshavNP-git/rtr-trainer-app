// Part 2 — Transmissions Practice Platform (RTR NP style)
// Scenario + question content is hardcoded from the user prompt.

export const part2Scenarios = [
  {
    id: "01",
    title: "VOGO - VOML",
    totalQuestions: 6,
    totalSubQuestions: 20,
    route: "VOGO → VOML RWY 06/24",
    status: "free",
    lockCost: 0,
    flightData: {
      reg: "VT-IND",
      type: "ATR72",
      dep: "VOGO",
      dest: "VOML",
      destRwy: "RWY 06/24",
      route: "Q12 NOBOD KANTI",
      stand: "Stand 3",
      rwy: "RWY 26",
      endurance: "05:30",
      frequencies: {
        ground: "121.9",
        tower: "118.1",
        approach: "119.7",
        control: "125.3"
      },
      weather: {
        atis: "INFORMATION DELTA",
        metar: "091430Z 08008KT 6000 FEW020 SCT080 28/24 Q1010"
      }
    },
    questions: [
      {
        id: "01-01",
        prompt: "Transmit the phrase that means: Let me know that you have received and understood this message",
        answer: "ROGER",
        category: "phraseology"
      },
      {
        id: "01-02",
        prompt: "Transmit the phrase that means: Yes",
        answer: "AFFIRM",
        category: "phraseology"
      },
      {
        id: "01-03",
        prompt: "Transmit the phrase that means: Permission for proposed action granted",
        answer: "APPROVED",
        category: "phraseology"
      },
      {
        id: "01-04",
        prompt: "Transmit the phrase that means: Examine a system or procedure",
        answer: "CHECK",
        category: "phraseology"
      },
      {
        id: "01-05",
        prompt: "Parked on stand, carry out radio check",
        answer: "Goa Ground, VT-IND, radio check on 121.9",
        category: "procedure"
      },
      {
        id: "01-06",
        prompt: "Request for departure information",
        answer: "Goa Ground, VT-IND, request departure information",
        category: "procedure"
      },
      {
        id: "01-07",
        prompt: "Request for Pushback and Startup",
        answer: "Goa Ground, VT-IND, Stand 3, ATR72, request pushback and startup, information Delta, QNH 1010",
        category: "procedure"
      },
      {
        id: "01-08",
        prompt: "Request for taxi clearance",
        answer: "Goa Ground, VT-IND, request taxi clearance, runway 26, information Delta",
        category: "procedure"
      },
      {
        id: "01-09",
        prompt: "You have spotted a fire tender on the second taxiway, take appropriate action",
        answer: "Goa Ground, VT-IND, fire tender observed on second taxiway, request instructions",
        category: "emergency"
      },
      {
        id: "01-10",
        prompt: "Request for ATC Clearance",
        answer: "Goa Control, VT-IND, request ATC clearance to Mangalore, route Q12 NOBOD KANTI, altitude [as filed], information Delta",
        category: "procedure"
      },
      {
        id: "01-11",
        prompt: "Inform ATC that you are ready for takeoff",
        answer: "Goa Tower, VT-IND, runway 26, ready for takeoff",
        category: "procedure"
      },
      {
        id: "01-12",
        prompt: "You have weather ahead, take action",
        answer: "Mumbai Control, VT-IND, request deviation [left/right] of track due weather",
        category: "emergency"
      },
      {
        id: "01-13",
        prompt: "You are at NOBOD 1005, Est KANTI 1025, ETA Mangalore 1040, give position report",
        answer: "Mumbai Control, VT-IND, position NOBOD at 1005, flight level [XX], estimating KANTI 1025, Mangalore 1040, endurance 05:30",
        category: "procedure"
      },
      {
        id: "01-14",
        prompt: "Suddenly an Indian Air Force fighter jet crosses 500 feet below you. RA, take action",
        answer:
          "Mumbai Control, VT-IND, TCAS RA, climbing / descending as advised\n(After clear of conflict:)\nMumbai Control, VT-IND, clear of conflict, returning to [cleared level], TCAS RA complete",
        category: "emergency"
      },
      {
        id: "01-15",
        prompt: "Port engine on fire, you are 150nm inbound VOML, inform ATC and take appropriate action",
        answer:
          "MAYDAY MAYDAY MAYDAY, Mangalore Approach, VT-IND, engine fire on port engine, 150nm inbound VOML, altitude [XX], 6 POB, endurance 05:30, request immediate approach, heading [XX]",
        category: "emergency"
      },
      {
        id: "01-16",
        prompt: "You have runway in sight, request for visual approach",
        answer: "Mangalore Approach, VT-IND, runway in sight, request visual approach runway 06",
        category: "procedure"
      },
      {
        id: "01-17",
        prompt: "Report finals",
        answer: "VT-IND, finals runway 06",
        category: "procedure"
      },
      {
        id: "01-18",
        prompt: "You have landed, contact ATC and taxi to stand",
        answer: "Mangalore Ground, VT-IND, vacated runway 06, request taxi to stand 3",
        category: "procedure"
      }
    ]
  },

  {
    id: "02",
    title: "VIDP - VECC",
    totalQuestions: 6,
    totalSubQuestions: 12,
    route: "VIDP → VECC",
    status: "free",
    lockCost: 0,
    flightData: {
      reg: "VT-AKD",
      type: "A320",
      dep: "VIDP",
      dest: "VECC",
      destRwy: "RWY 01R/19L",
      route: "G463 INTIK PABDA",
      stand: "Stand 12",
      rwy: "RWY 28",
      endurance: "04:15",
      frequencies: {
        ground: "121.7",
        tower: "118.3",
        approach: "125.1",
        control: "131.2"
      },
      weather: {
        atis: "INFORMATION FOXTROT",
        metar: "091600Z 23012KT 5000 BKN030 32/27 Q1008"
      }
    },
    questions: [
      {
        id: "02-01",
        prompt: "Request for startup clearance at Delhi",
        answer: "Delhi Ground, VT-AKD, Stand 12, Airbus A320, request startup, destination Kolkata, information Foxtrot, QNH 1008",
        category: "procedure"
      },
      {
        id: "02-02",
        prompt: "You are given pushback approval, read back clearance",
        answer: "Pushback approved, facing [direction], VT-AKD",
        category: "procedure"
      },
      {
        id: "02-03",
        prompt: "Request taxi clearance",
        answer: "Delhi Ground, VT-AKD, request taxi runway 28, information Foxtrot",
        category: "procedure"
      },
      {
        id: "02-04",
        prompt: "Transmit the phrase that means: I have received all your last transmission",
        answer: "ROGER",
        category: "phraseology"
      },
      {
        id: "02-05",
        prompt: "ATC asks: 'Are you ready to copy ATC clearance?' Reply appropriately",
        answer: "Ready to copy, VT-AKD",
        category: "phraseology"
      },
      {
        id: "02-06",
        prompt:
          "You receive clearance — read back: 'VT-AKD cleared to Kolkata via G463 INTIK PABDA, maintain FL 270, squawk 4521'",
        answer: "Cleared to Kolkata via G463 INTIK PABDA, maintain FL 270, squawk 4521, VT-AKD",
        category: "procedure"
      },
      {
        id: "02-07",
        prompt: "You are airborne, check in with Mumbai Control",
        answer: "Kolkata Control, VT-AKD, passing FL [XX], climbing FL 270",
        category: "procedure"
      },
      {
        id: "02-08",
        prompt: "ATC instructs you to report PABDA",
        answer: "Wilco, VT-AKD\n(On reaching PABDA:)\nKolkata Control, VT-AKD, PABDA",
        category: "procedure"
      },
      {
        id: "02-09",
        prompt: "Passenger takes ill enroute, request priority",
        answer:
          "PAN PAN PAN PAN PAN PAN, Kolkata Control, VT-AKD, medical emergency on board, request priority landing, endurance 04:00, 168 POB, position [XX], FL 270",
        category: "emergency"
      },
      {
        id: "02-10",
        prompt: "Request descent",
        answer: "Kolkata Control, VT-AKD, request descent",
        category: "procedure"
      },
      {
        id: "02-11",
        prompt: "You are given: 'Descend to FL 100, report passing FL 200'",
        answer: "Descend to FL 100, wilco report passing FL 200, VT-AKD",
        category: "procedure"
      },
      {
        id: "02-12",
        prompt: "Report finals runway 01R",
        answer: "VT-AKD, finals runway 01R",
        category: "procedure"
      }
    ]
  },

  {
    id: "03",
    title: "VEGT - VEIM",
    totalQuestions: 6,
    totalSubQuestions: 16,
    route: "VEGT → VEIM",
    status: "free",
    lockCost: 0,
    flightData: {
      reg: "VT-REX",
      type: "ATR72",
      dep: "VEGT",
      dest: "VEIM",
      destRwy: "RWY 04/22",
      route: "Direct",
      stand: "Stand 1",
      rwy: "RWY 03",
      endurance: "02:45",
      frequencies: {
        ground: "121.6",
        tower: "118.4",
        approach: "119.5",
        control: "124.3"
      },
      weather: {
        atis: "INFORMATION CHARLIE",
        metar: "091200Z 04010KT 4000 FEW015 BKN080 24/20 Q1013"
      }
    },
    questions: [
      {
        id: "03-01",
        prompt: "Carry out radio check on ground frequency",
        answer: "Agartala Ground, VT-REX, radio check on 121.6",
        category: "procedure"
      },
      {
        id: "03-02",
        prompt: "Request departure information",
        answer: "Agartala Ground, VT-REX, request departure information",
        category: "procedure"
      },
      {
        id: "03-03",
        prompt: "Request pushback and startup, information Charlie, QNH 1013",
        answer: "Agartala Ground, VT-REX, Stand 1, ATR72, request pushback and startup, information Charlie, QNH 1013",
        category: "procedure"
      },
      {
        id: "03-04",
        prompt: "Request taxi clearance",
        answer: "Agartala Ground, VT-REX, request taxi runway 03, information Charlie",
        category: "procedure"
      },
      {
        id: "03-05",
        prompt: "Request ATC clearance",
        answer: "Kolkata Control, VT-REX, request ATC clearance to Imphal, direct, altitude [as filed], information Charlie",
        category: "procedure"
      },
      {
        id: "03-06",
        prompt: "Ready for departure, inform tower",
        answer: "Agartala Tower, VT-REX, runway 03, ready for departure",
        category: "procedure"
      },
      {
        id: "03-07",
        prompt: "After takeoff, check in with en-route control",
        answer: "Kolkata Control, VT-REX, airborne Agartala, passing [XX], climbing FL [XX]",
        category: "procedure"
      },
      {
        id: "03-08",
        prompt: "Visibility deteriorating rapidly, take action",
        answer: "Kolkata Control, VT-REX, reporting deteriorating visibility, request weather information and alternate instructions",
        category: "procedure"
      },
      {
        id: "03-09",
        prompt: "Request descent into Imphal",
        answer: "Kolkata Control, VT-REX, request descent, estimating Imphal [time]",
        category: "procedure"
      },
      {
        id: "03-10",
        prompt: "Report field in sight",
        answer: "Imphal Approach, VT-REX, field in sight, request visual approach runway 04",
        category: "procedure"
      },
      {
        id: "03-11",
        prompt: "Tower instructs: 'Report when on final'",
        answer: "Wilco, VT-REX\n(On final:)\nVT-REX, finals runway 04",
        category: "procedure"
      },
      {
        id: "03-12",
        prompt: "After landing, taxi to stand",
        answer: "Imphal Ground, VT-REX, vacated runway 04, request taxi to stand 1",
        category: "procedure"
      }
    ]
  },

  {
    id: "04",
    title: "VIAR - VIJP",
    totalQuestions: 6,
    totalSubQuestions: 17,
    route: "VIAR → VIJP",
    status: "free",
    lockCost: 0,
    flightData: {
      reg: "VT-SKY",
      type: "B737-800",
      dep: "VIAR",
      dest: "VIJP",
      destRwy: "RWY 09/27",
      route: "W11 ORBAD PIPKA",
      stand: "Stand 5",
      rwy: "RWY 30",
      endurance: "03:30",
      frequencies: {
        ground: "121.8",
        tower: "118.2",
        approach: "120.1",
        control: "126.5"
      },
      weather: {
        atis: "INFORMATION BRAVO",
        metar: "091000Z 30015KT 7000 SKC 38/22 Q1005"
      }
    },
    questions: [
      {
        id: "04-01",
        prompt: "Request startup",
        answer: "Amritsar Ground, VT-SKY, Stand 5, B737-800, request startup, Jaipur, information Bravo, QNH 1005",
        category: "procedure"
      },
      {
        id: "04-02",
        prompt: "ATC reads back incorrect QNH — take action",
        answer: "Negative, VT-SKY, QNH 1005, confirm",
        category: "procedure"
      },
      {
        id: "04-03",
        prompt: "Request ATC clearance",
        answer: "Delhi Control, VT-SKY, request ATC clearance to Jaipur, W11 ORBAD PIPKA, altitude [as filed], information Bravo",
        category: "procedure"
      },
      {
        id: "04-04",
        prompt: "Transmit phrase meaning: I understand your message and will comply",
        answer: "WILCO",
        category: "phraseology"
      },
      {
        id: "04-05",
        prompt: "Request taxi clearance",
        answer: "Amritsar Ground, VT-SKY, request taxi runway 30, information Bravo",
        category: "procedure"
      },
      {
        id: "04-06",
        prompt: "You are lined up on runway — ready for takeoff",
        answer: "Amritsar Tower, VT-SKY, runway 30, ready for takeoff",
        category: "procedure"
      },
      {
        id: "04-07",
        prompt: "Immediately after takeoff, bird strike suspected — take action",
        answer:
          "Amritsar Tower, VT-SKY, bird strike suspected, request return to land, runway 30, fuel burn required [or] request immediate return",
        category: "emergency"
      },
      {
        id: "04-08",
        prompt: "En-route, ATC asks you to expedite climb — respond",
        answer: "Expediting climb, VT-SKY",
        category: "procedure"
      },
      {
        id: "04-09",
        prompt: "Report ORBAD",
        answer: "Delhi Control, VT-SKY, ORBAD",
        category: "procedure"
      },
      {
        id: "04-10",
        prompt: "You are given squawk 2345 — read back",
        answer: "Squawk 2345, VT-SKY",
        category: "procedure"
      },
      {
        id: "04-11",
        prompt: "Request ILS approach runway 27 at Jaipur",
        answer: "Jaipur Approach, VT-SKY, request ILS approach runway 27",
        category: "procedure"
      },
      {
        id: "04-12",
        prompt: "Backtrack required on runway — request",
        answer: "Jaipur Ground, VT-SKY, request backtrack runway 27",
        category: "procedure"
      }
    ]
  },

  {
    id: "05",
    title: "VABP - VAJB",
    totalQuestions: 6,
    totalSubQuestions: 21,
    route: "VABP → VAJB",
    status: "free",
    lockCost: 0,
    flightData: {
      reg: "VT-MPR",
      type: "ATR42",
      dep: "VABP",
      dest: "VAJB",
      destRwy: "RWY 14/32",
      route: "Direct",
      stand: "Stand 2",
      rwy: "RWY 19",
      endurance: "01:55",
      frequencies: {
        ground: "121.5",
        tower: "118.5",
        approach: "119.8",
        control: "122.7"
      },
      weather: {
        atis: "INFORMATION ALPHA",
        metar: "091330Z 19005KT 3000 HZ FEW020 37/24 Q1007"
      }
    },
    questions: [
      {
        id: "05-01",
        prompt: "Radio check on ground",
        answer: "Bhopal Ground, VT-MPR, radio check on 121.5",
        category: "procedure"
      },
      {
        id: "05-02",
        prompt: "Visibility is 3000m with haze — transmit phrase meaning: The meteorological visibility is...",
        answer: "QBI\n(or)\nBhopal Ground, VT-MPR, reporting visibility 3000 metres, haze",
        category: "procedure"
      },
      {
        id: "05-03",
        prompt: "Request pushback, startup, information Alpha, QNH 1007",
        answer: "Bhopal Ground, VT-MPR, Stand 2, ATR42, request pushback and startup, information Alpha, QNH 1007",
        category: "procedure"
      },
      {
        id: "05-04",
        prompt: "Taxi clearance request",
        answer: "Bhopal Ground, VT-MPR, request taxi runway 19, information Alpha",
        category: "procedure"
      },
      {
        id: "05-05",
        prompt: "Ready for departure",
        answer: "Bhopal Tower, VT-MPR, runway 19, ready for departure",
        category: "procedure"
      },
      {
        id: "05-06",
        prompt: "Airborne — contact Nagpur Control",
        answer: "Nagpur Control, VT-MPR, airborne Bhopal, passing [XX], climbing FL [XX], estimating Jabalpur [time]",
        category: "procedure"
      },
      {
        id: "05-07",
        prompt: "Turbulence encountered — report to ATC",
        answer: "Nagpur Control, VT-MPR, reporting moderate turbulence at FL [XX], request alternative altitude",
        category: "procedure"
      },
      {
        id: "05-08",
        prompt: "ATC says 'Squawk Ident' — take action",
        answer: "Ident, VT-MPR",
        category: "procedure"
      },
      {
        id: "05-09",
        prompt: "You observe another aircraft at same level — take action",
        answer: "Nagpur Control, VT-MPR, traffic in sight, request altitude change",
        category: "procedure"
      },
      {
        id: "05-10",
        prompt: "Descend for Jabalpur, request",
        answer: "Nagpur Control, VT-MPR, request descent, estimating Jabalpur [time]",
        category: "procedure"
      },
      {
        id: "05-11",
        prompt: "Report when visual with runway",
        answer: "Wilco, VT-MPR\n(On sighting:)\nJabalpur Approach, VT-MPR, runway in sight, request visual approach runway 14",
        category: "procedure"
      },
      {
        id: "05-12",
        prompt: "After landing at Jabalpur, taxi to stand",
        answer: "Jabalpur Ground, VT-MPR, vacated runway 14, request taxi to stand 2",
        category: "procedure"
      }
    ]
  },

  {
    id: "06",
    title: "VABB - OMDB",
    totalQuestions: 6,
    totalSubQuestions: 19,
    route: "VABB → OMDB",
    status: "free",
    lockCost: 0,
    flightData: {
      reg: "VT-INT",
      type: "B777-300ER",
      dep: "VABB",
      dest: "OMDB",
      destRwy: "RWY 12L/30R",
      route: "M318 LAKDI ALPOR",
      stand: "Gate 24",
      rwy: "RWY 27",
      endurance: "08:45",
      frequencies: {
        ground: "121.7",
        tower: "118.45",
        approach: "120.4",
        control: "131.5"
      },
      weather: {
        atis: "INFORMATION ECHO",
        metar: "091430Z 27020KT 8000 FEW030 35/26 Q1009"
      }
    },
    questions: [
      {
        id: "06-01",
        prompt: "Startup request, Mumbai",
        answer: "Mumbai Ground, VT-INT, Gate 24, B777-300ER, request startup, destination Dubai, information Echo, QNH 1009",
        category: "procedure"
      },
      {
        id: "06-02",
        prompt: "ATC clearance request",
        answer: "Mumbai Control, VT-INT, request ATC clearance to Dubai, M318 LAKDI ALPOR, altitude [as filed], information Echo",
        category: "procedure"
      },
      {
        id: "06-03",
        prompt: "Read back: 'VT-INT cleared to Dubai via M318 LAKDI ALPOR, maintain FL 370, squawk 6712'",
        answer: "Cleared to Dubai via M318 LAKDI ALPOR, maintain FL 370, squawk 6712, VT-INT",
        category: "procedure"
      },
      {
        id: "06-04",
        prompt: "Airborne, check in with Mumbai Control",
        answer: "Mumbai Control, VT-INT, airborne Mumbai, passing FL [XX], climbing FL 370",
        category: "procedure"
      },
      {
        id: "06-05",
        prompt: "FIR boundary crossing — check in with Karachi Control",
        answer: "Karachi Control, VT-INT, FL 370, estimating ALPOR [time]",
        category: "procedure"
      },
      {
        id: "06-06",
        prompt: "You are at ALPOR, entering UAE airspace — contact UAE Control",
        answer: "UAE Control, VT-INT, ALPOR at [time], FL 370, estimating Dubai [time]",
        category: "procedure"
      },
      {
        id: "06-07",
        prompt: "Passenger medical emergency on board — take action",
        answer: "PAN PAN PAN PAN PAN PAN, UAE Control, VT-INT, medical emergency on board, 350 POB, fuel 8 hours, request priority descent and landing Dubai",
        category: "emergency"
      },
      {
        id: "06-08",
        prompt: "Request ILS approach runway 30R at Dubai",
        answer: "Dubai Approach, VT-INT, request ILS approach runway 30R",
        category: "procedure"
      },
      {
        id: "06-09",
        prompt: "Transmit phrase meaning: I will comply with your instruction",
        answer: "WILCO",
        category: "phraseology"
      },
      {
        id: "06-10",
        prompt: "Report outer marker",
        answer: "VT-INT, outer marker",
        category: "procedure"
      },
      {
        id: "06-11",
        prompt: "Report finals runway 30R",
        answer: "VT-INT, finals runway 30R",
        category: "procedure"
      },
      {
        id: "06-12",
        prompt: "After landing at Dubai, request taxi to stand",
        answer: "Dubai Ground, VT-INT, vacated runway 30R, request taxi to Gate [assigned]",
        category: "procedure"
      }
    ]
  }
];
