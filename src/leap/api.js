import { useEffect, useState } from 'react'
import {
  ELECTION_TYPES,
  ASSEMBLIES,
  mandalsFor,
  townsFor,
  constituenciesFor,
  positionsFor,
  reservationFor,
  positionById,
  proposalsFor,
  addProposal,
  searchCadreRows,
} from './mockData.js'

// This build has no backend: every call below resolves against the static rows
// in mockData.js. The signatures are the ones the FastAPI endpoints (S1–S13)
// used, so swapping the fetch layer back in means replacing only this file.
// The small delay keeps the "Searching…" / "Assigning…" states visible.
const resolve = (fn) =>
  new Promise((done, fail) => {
    setTimeout(() => {
      try {
        done(fn())
      } catch (err) {
        fail(err)
      }
    }, 150)
  })

export const getElectionTypes = () => resolve(() => ELECTION_TYPES)
export const getAssemblies = () => resolve(() => ASSEMBLIES)
export const getMandals = (constituencyId) => resolve(() => mandalsFor(constituencyId))
export const getTowns = (constituencyId) => resolve(() => townsFor(constituencyId))

export const getProposalConstituenciesByTehsil = (constituencyId, tehsilId, electionTypeId) =>
  resolve(() => {
    const mandal = mandalsFor(constituencyId).find((m) => String(m.tehsil_id) === String(tehsilId))
    return mandal ? constituenciesFor('m', tehsilId, mandal.tehsil_name, electionTypeId) : []
  })

export const getProposalConstituenciesByTown = (constituencyId, townId, electionTypeId) =>
  resolve(() => {
    const town = townsFor(constituencyId).find((t) => String(t.town_id) === String(townId))
    return town ? constituenciesFor('t', townId, town.town_name, electionTypeId) : []
  })

export const getPositionsOverview = (proposalConstituencyId) =>
  resolve(() => positionsFor(proposalConstituencyId))

export const getReservation = (proposalConstituencyId) =>
  resolve(() => [{ reservation_type: reservationFor(proposalConstituencyId) }])

export const checkPositionAvailability = (proposalPositionId) =>
  resolve(() => {
    const row = positionById(proposalPositionId)
    if (!row) throw new Error('Position not found.')
    return { available: proposalsFor(proposalPositionId).length < row.max_proposals }
  })

export const assignCandidate = (proposalPositionId, tdpCadreId) =>
  resolve(() => addProposal(proposalPositionId, tdpCadreId))

export const searchCadre = (proposalConstituencyId, searchType, searchValue) =>
  resolve(() => searchCadreRows(searchType, searchValue))

export const getProposalCandidates = (proposalPositionId) =>
  resolve(() => proposalsFor(proposalPositionId))

// Loads a list on mount / when deps change. Returns [] until it resolves,
// and [] again if the request fails (error is logged, not shown).
export function useList(load, deps) {
  const [items, setItems] = useState([])
  useEffect(() => {
    let cancelled = false
    if (!load) {
      setItems([])
      return
    }
    load()
      .then((data) => { if (!cancelled) setItems(data) })
      .catch((err) => { if (!cancelled) { console.error(err); setItems([]) } })
    return () => { cancelled = true }
  }, deps)
  return items
}
