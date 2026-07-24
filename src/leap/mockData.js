// Static stand-in for the FastAPI backend (endpoints S1–S13), so the frontend
// runs with no server. Every name, ID, phone number and photo here is invented.
// Row shapes match what the components read; see api.js for the call surface.

export const ELECTION_TYPES = [
  { proposal_election_type_id: 1, election_type: 'Panchayat' },
  { proposal_election_type_id: 2, election_type: 'Ward' },
  { proposal_election_type_id: 3, election_type: 'MPTC' },
  { proposal_election_type_id: 4, election_type: 'ZPTC' },
  { proposal_election_type_id: 5, election_type: 'MPP' },
  { proposal_election_type_id: 6, election_type: 'ZP' },
  { proposal_election_type_id: 7, election_type: 'Municipality' },
  { proposal_election_type_id: 8, election_type: 'Corporation' },
]

export const ASSEMBLIES = [
  { constituency_id: 101, constituency_name: 'Tirupati' },
  { constituency_id: 102, constituency_name: 'Chittoor' },
  { constituency_id: 103, constituency_name: 'Madanapalle' },
  { constituency_id: 104, constituency_name: 'Srikalahasti' },
  { constituency_id: 105, constituency_name: 'Punganur' },
  { constituency_id: 106, constituency_name: 'Kuppam' },
]

const MANDALS = {
  101: [
    { tehsil_id: 1001, tehsil_name: 'Renigunta' },
    { tehsil_id: 1002, tehsil_name: 'Yerpedu' },
    { tehsil_id: 1003, tehsil_name: 'Chandragiri' },
  ],
  102: [
    { tehsil_id: 1004, tehsil_name: 'Gudipala' },
    { tehsil_id: 1005, tehsil_name: 'Bangarupalem' },
  ],
  103: [
    { tehsil_id: 1006, tehsil_name: 'Nimmanapalle' },
    { tehsil_id: 1007, tehsil_name: 'Ramasamudram' },
  ],
  104: [{ tehsil_id: 1008, tehsil_name: 'Thottambedu' }],
  105: [{ tehsil_id: 1009, tehsil_name: 'Sodam' }],
  106: [
    { tehsil_id: 1010, tehsil_name: 'Ramakuppam' },
    { tehsil_id: 1011, tehsil_name: 'Santhipuram' },
  ],
}

// Punganur has no town on purpose — it exercises the "no local body configured"
// hint in step 4.
const TOWNS = {
  101: [{ town_id: 2001, town_name: 'Tirupati' }],
  102: [{ town_id: 2002, town_name: 'Chittoor' }],
  103: [{ town_id: 2003, town_name: 'Madanapalle' }],
  104: [{ town_id: 2004, town_name: 'Srikalahasti' }],
  106: [{ town_id: 2005, town_name: 'Kuppam' }],
}

export const mandalsFor = (constituencyId) => MANDALS[constituencyId] || []
export const townsFor = (constituencyId) => TOWNS[constituencyId] || []

// The bodies each election type contests, named off the mandal/town.
const BODY_NAMES = {
  1: (n) => [`${n} Gram Panchayat`, `${n} East Gram Panchayat`],
  2: (n) => [`${n} Ward 1`, `${n} Ward 2`, `${n} Ward 3`],
  3: (n) => [`${n} MPTC Constituency`],
  4: (n) => [`${n} ZPTC Constituency`],
  5: (n) => [`${n} Mandal Parishad`],
  6: (n) => [`${n} Zilla Parishad`],
  7: (n) => [`${n} Municipality`],
  8: (n) => [`${n} Municipal Corporation`],
}

// Roles per election type, with seat and proposal caps.
const ROLES = {
  1: [
    { role_name: 'Sarpanch', max_positions: 1, max_proposals: 3 },
    { role_name: 'Upa-Sarpanch', max_positions: 1, max_proposals: 2 },
    { role_name: 'Ward Member', max_positions: 5, max_proposals: 8 },
  ],
  2: [{ role_name: 'Ward Councillor', max_positions: 1, max_proposals: 3 }],
  3: [{ role_name: 'MPTC Member', max_positions: 1, max_proposals: 3 }],
  4: [{ role_name: 'ZPTC Member', max_positions: 1, max_proposals: 3 }],
  5: [
    { role_name: 'Mandal Parishad President', max_positions: 1, max_proposals: 2 },
    { role_name: 'Vice President', max_positions: 1, max_proposals: 2 },
  ],
  6: [
    { role_name: 'ZP Chairperson', max_positions: 1, max_proposals: 2 },
    { role_name: 'ZP Vice Chairperson', max_positions: 1, max_proposals: 2 },
  ],
  7: [
    { role_name: 'Municipal Chairperson', max_positions: 1, max_proposals: 3 },
    { role_name: 'Vice Chairperson', max_positions: 1, max_proposals: 2 },
    { role_name: 'Councillor', max_positions: 8, max_proposals: 12 },
  ],
  8: [
    { role_name: 'Mayor', max_positions: 1, max_proposals: 3 },
    { role_name: 'Deputy Mayor', max_positions: 1, max_proposals: 2 },
    { role_name: 'Corporator', max_positions: 10, max_proposals: 15 },
  ],
}

const RESERVATIONS = ['BC (Woman)', 'SC', '', 'ST (Woman)', 'BC', 'SC (Woman)']

// Constituencies and their positions are minted on first request and cached, so
// the ids stay stable across re-reads (S7 and S9 are keyed by them).
const constituencies = new Map() // key -> [{proposal_consituency_id, constituency_name}]
const constituencyMeta = new Map() // pcId -> {electionTypeId}
const positions = new Map() // pcId -> [position rows]
let nextPcId = 5000
let nextPositionId = 7000

export function constituenciesFor(locationType, locationId, locationName, electionTypeId) {
  const key = `${locationType}:${locationId}:${electionTypeId}`
  if (!constituencies.has(key)) {
    const build = BODY_NAMES[electionTypeId] || BODY_NAMES[1]
    constituencies.set(
      key,
      build(locationName).map((constituency_name) => {
        const proposal_consituency_id = (nextPcId += 1)
        constituencyMeta.set(proposal_consituency_id, { electionTypeId })
        return { proposal_consituency_id, constituency_name }
      })
    )
  }
  return constituencies.get(key)
}

export function positionsFor(proposalConstituencyId) {
  const pcId = Number(proposalConstituencyId)
  if (!positions.has(pcId)) {
    const { electionTypeId } = constituencyMeta.get(pcId) || { electionTypeId: 1 }
    positions.set(
      pcId,
      (ROLES[electionTypeId] || ROLES[1]).map((role, i) => {
        const proposal_position_id = (nextPositionId += 1)
        // Seed the first role of each body with one proposal so "View Members"
        // has something to show before anything is assigned.
        if (i === 0) proposals.set(proposal_position_id, [makeProposal(proposal_position_id, CADRE[0])])
        return { proposal_position_id, ...role }
      })
    )
  }
  return positions.get(pcId).map((p) => ({
    ...p,
    proposed_cnt: (proposals.get(p.proposal_position_id) || []).length,
  }))
}

export function reservationFor(proposalConstituencyId) {
  return RESERVATIONS[Number(proposalConstituencyId) % RESERVATIONS.length]
}

// A plain silhouette so a few cards render the photo path (and its lightbox)
// without loading anything off the network.
const avatar = (bg) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E` +
  `%3Crect width='80' height='80' fill='%23${bg}'/%3E` +
  `%3Ccircle cx='40' cy='31' r='14' fill='%23ffffff'/%3E` +
  `%3Cpath d='M12 78c0-16 12.5-26 28-26s28 10 28 26z' fill='%23ffffff'/%3E%3C/svg%3E`

function cadre(tdp_cadre_id, member_name, gender, age, category_name, caste_name, relative_type, relative_name, mandal_town_name, constituency_name, img_url) {
  return {
    tdp_cadre_id,
    member_name,
    membership_id: `MEM-${100000 + tdp_cadre_id}`,
    mobile_no: `98${String(49000000 + tdp_cadre_id * 137).slice(-8)}`,
    gender,
    age,
    category_name,
    caste_name,
    voter_id_card_no: `APZ${1200000 + tdp_cadre_id * 53}`,
    panchayat_name: `${mandal_town_name} Gram Panchayat`,
    mandal_town_name,
    constituency_name,
    relative_type,
    relative_name,
    img_url,
  }
}

export const CADRE = [
  cadre(3101, 'K. Ramesh Babu', 'Male', 46, 'BC', 'Weaver', 'S/o', 'K. Narayana', 'Renigunta', 'Tirupati', avatar('f59e0b')),
  cadre(3102, 'P. Lakshmi Devi', 'Female', 39, 'SC', 'Mala', 'W/o', 'P. Suresh', 'Yerpedu', 'Tirupati', avatar('3b82f6')),
  cadre(3103, 'M. Suresh Kumar', 'Male', 52, 'OC', 'Kamma', 'S/o', 'M. Venkaiah', 'Chandragiri', 'Tirupati', ''),
  cadre(3104, 'V. Anitha Reddy', 'Female', 41, 'OC', 'Reddy', 'W/o', 'V. Mohan Reddy', 'Gudipala', 'Chittoor', avatar('10b981')),
  cadre(3105, 'G. Narayana Rao', 'Male', 58, 'BC', 'Yadava', 'S/o', 'G. Subbaiah', 'Bangarupalem', 'Chittoor', ''),
  cadre(3106, 'S. Padma Priya', 'Female', 35, 'ST', 'Konda Reddy', 'D/o', 'S. Ramaiah', 'Nimmanapalle', 'Madanapalle', ''),
  cadre(3107, 'T. Venkata Rao', 'Male', 49, 'BC', 'Fisherman', 'S/o', 'T. Appalaswamy', 'Ramasamudram', 'Madanapalle', ''),
  cadre(3108, 'D. Kavitha', 'Female', 44, 'BC', 'Goud', 'W/o', 'D. Prasad', 'Thottambedu', 'Srikalahasti', ''),
  cadre(3109, 'B. Chandra Sekhar', 'Male', 37, 'SC', 'Madiga', 'S/o', 'B. Yesu Ratnam', 'Sodam', 'Punganur', ''),
  cadre(3110, 'N. Rajeswari', 'Female', 50, 'OC', 'Balija', 'W/o', 'N. Srinivasulu', 'Ramakuppam', 'Kuppam', ''),
  cadre(3111, 'A. Srinivasa Rao', 'Male', 43, 'BC', 'Padmasali', 'S/o', 'A. Ramulu', 'Santhipuram', 'Kuppam', ''),
  cadre(3112, 'C. Manjula', 'Female', 33, 'SC', 'Mala', 'D/o', 'C. Anjaiah', 'Tirupati', 'Tirupati', ''),
  cadre(3113, 'R. Prasada Rao', 'Male', 61, 'OC', 'Kapu', 'S/o', 'R. Satyanarayana', 'Chittoor', 'Chittoor', ''),
  cadre(3114, 'L. Haritha', 'Female', 29, 'BC', 'Mudiraj', 'D/o', 'L. Krishnaiah', 'Madanapalle', 'Madanapalle', ''),
]

const SEARCH_FIELDS = {
  Name: (c) => c.member_name,
  MembershipId: (c) => c.membership_id,
  MobileNo: (c) => c.mobile_no,
}

export function searchCadreRows(searchType, searchValue) {
  const field = SEARCH_FIELDS[searchType]
  if (!field) throw new Error(`Unknown search type "${searchType}"`)
  const needle = searchValue.trim().toLowerCase()
  return CADRE.filter((c) => String(field(c)).toLowerCase().includes(needle))
}

// Proposals made so far, per position. Assigning mutates this, so the counts
// and member lists reflect it on the next read.
const proposals = new Map()
let nextProposalId = 9000

function makeProposal(positionId, cadreRow) {
  return { proposal_candidate_id: (nextProposalId += 1), ...cadreRow }
}

export const proposalsFor = (proposalPositionId) => proposals.get(Number(proposalPositionId)) || []

export const positionById = (proposalPositionId) =>
  [...positions.values()].flat().find((p) => p.proposal_position_id === Number(proposalPositionId))

export function addProposal(proposalPositionId, tdpCadreId) {
  const positionId = Number(proposalPositionId)
  const row = positionById(positionId)
  if (!row) throw new Error('Position not found.')

  const current = proposals.get(positionId) || []
  if (current.length >= row.max_proposals) {
    throw new Error(`${row.role_name} has reached its maximum of ${row.max_proposals} proposals.`)
  }
  if (current.some((c) => c.tdp_cadre_id === Number(tdpCadreId))) {
    throw new Error('This cadre has already been proposed for this position.')
  }
  const cadreRow = CADRE.find((c) => c.tdp_cadre_id === Number(tdpCadreId))
  if (!cadreRow) throw new Error('Cadre not found.')

  proposals.set(positionId, [...current, makeProposal(positionId, cadreRow)])
  return { proposal_candidate_id: nextProposalId }
}
