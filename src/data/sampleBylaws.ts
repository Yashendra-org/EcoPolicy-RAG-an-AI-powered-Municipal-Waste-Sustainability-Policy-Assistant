import { BylawDocument } from '../types';

export const INITIAL_BYLAWS: BylawDocument[] = [
  {
    id: 'bylaw-2026-b8',
    title: 'Municipal Solid Waste & Recycling Bylaw 2026-B8',
    category: 'Waste Management',
    code: 'BY-2026-B8',
    effectiveDate: '2026-01-15',
    summary: 'Comprehensive municipal guidelines for residential and commercial waste segregation, organic green bins, and mandatory recycling protocols.',
    chunksCount: 8,
    content: `
SECTION 1: RESIDENTIAL WASTE SEGREGATION
1.1 All residential properties within the municipal district must maintain three distinct waste receptacles: Organic Green Bin (compostable organics), Blue Bin (dry recyclable paper, metal, glass, rigid plastics #1-#7), and Black Bin (residual non-recyclable refuse).
1.2 Contamination of the Organic Green Bin with plastic bags, pet waste, or electronic waste exceeding 5% by weight shall result in a first-offence warning notice under Clause 4.2. Repeat violations incur a municipal fine of $150.
1.3 Yard trimmings, grass clippings, and branches under 5cm in diameter must be bundled or placed in certified kraft paper yard waste bags between April 1st and November 30th. Plastic bags for yard waste are strictly prohibited.

SECTION 2: COMMERCIAL & MULTI-FAMILY RECYCLING MANDATE
2.1 Commercial establishments, restaurants, and apartment complexes with 10 or more units must provide centralized diversion stations for cardboard, glass, organic food scraps, and metal cans.
2.2 Cardboard boxes must be flattened and tied or placed inside designated corrugated cardboard recycling compactors. Leaving unsecured cardboard loose beside outdoor dumpsters is a violation of Section 2.2.
2.3 Cooking oil and commercial grease must not be disposed of in municipal sewer drains or regular trash dumpsters. Facilities must contract a certified grease-trap recycling service with bi-monthly collection logs.
    `.trim()
  },
  {
    id: 'bylaw-2025-eb',
    title: 'Green Building & Energy Efficiency Code 2025-E4',
    category: 'Energy & Buildings',
    code: 'BY-2025-E4',
    effectiveDate: '2025-06-01',
    summary: 'Energy performance standards, rooftop solar mandates, and carbon emission caps for new commercial and residential developments.',
    chunksCount: 6,
    content: `
SECTION 3: NET-ZERO ENERGY & RENEWABLE READINESS
3.1 All new residential constructions exceeding 2,500 square feet must incorporate structural roof reinforcement and conduit capacity capable of supporting a minimum 6 kW photovoltaic (solar) array.
3.2 Exterior commercial lighting installed after January 2025 must utilize high-efficiency LED fixtures with full cutoff optics (Dark Sky compliant) and automatic astronomical time clocks or ambient photocells.
3.3 Commercial buildings over 50,000 square feet must report annual greenhouse gas (GHG) emissions to the Municipal Environmental Board by March 31st each calendar year using the Municipal Energy Star Portfolio Manager.
    `.trim()
  },
  {
    id: 'bylaw-2025-ws',
    title: 'Water Conservation & Stormwater Management Bylaw 2025-W9',
    category: 'Water & Stormwater',
    code: 'BY-2025-W9',
    effectiveDate: '2025-04-10',
    summary: 'Regulations on outdoor lawn watering schedules, greywater recycling systems, and commercial stormwater runoff mitigation.',
    chunksCount: 7,
    content: `
SECTION 4: LAWN WATERING RESTRICTIONS & IRRIGATION
4.1 Outdoor lawn watering for residential properties using municipal potable water is restricted to designated even/odd calendar days between the hours of 4:00 AM and 9:00 AM, and 7:00 PM and 10:00 PM.
4.2 Smart irrigation controllers equipped with rain sensors or evapotranspiration (ET) weather adjustments are mandatory for all newly installed automatic sprinkler systems.
4.3 Washing paved driveways, sidewalks, or exterior building facades with running municipal hoses is prohibited unless utilizing a high-pressure low-flow nozzle with an automatic shut-off valve.

SECTION 5: STORMWATER RUNOFF & PERMEABLE PAVERS
5.1 Parking lots exceeding 20 vehicle stalls must incorporate a minimum of 25% permeable asphalt, interlocking permeable concrete pavers, or engineered bio-swales to filter on-site stormwater runoff.
    `.trim()
  },
  {
    id: 'bylaw-2024-hz',
    title: 'Hazardous Waste & E-Waste Disposal Directive 2024-H2',
    category: 'Hazardous & E-Waste',
    code: 'BY-2024-H2',
    effectiveDate: '2024-09-01',
    summary: 'Procedures for safe disposal of household hazardous waste, rechargeable lithium-ion batteries, and electronic equipment.',
    chunksCount: 6,
    content: `
SECTION 6: HOUSEHOLD HAZARDOUS WASTE (HHW)
6.1 Liquid paints, chemical solvents, pesticides, and automotive fluids must never be poured into municipal storm drains or household sinks. Residents must deliver HHW to the Eco-Depot Hazardous Waste Station on Saturdays between 8:00 AM and 4:00 PM.
6.2 Rechargeable lithium-ion batteries (found in phones, laptops, and cordless tools) present severe fire hazards in standard garbage or recycling trucks. Retailers selling lithium-ion batteries must provide dedicated customer drop-off collection boxes at store entrances.
6.3 Electronic waste including televisions, computer monitors, printers, and audio gear must be recycled through certified Electronic Products Stewardship Canada (EPSC) collection partners.
    `.trim()
  }
];
