import type { AbilityFilterInterface } from '../types/AbilityFilter.interface'
import type { AbilityInterface } from '../types/Ability.interface'
import type { AbilitySlotInterface } from '../types/AbilitySlot.interface'
import { AbilityType } from '../types/Ability.type'
import allSeatsJSON from '../assets/seatdata.json'

self.addEventListener('message', e => {
	//const start = Date.now()
	const shipIds = filterShips(e.data as AbilityFilterInterface[])
	//const stop = Date.now()
	//console.log(`Filtering took ${(stop - start)/1000} seconds`)
	self.postMessage(shipIds)
})

//const allShips = allShipsJSON as ShipInterface[]
const allSeats = allSeatsJSON

// helper to make indexing the seat array values more intuitive
const Seat = {
	rank: 0,
	type: 1,
	spec: 2
} as const

function filterShips(abilities: AbilityFilterInterface[]) {

	const NONSPECS: AbilityType[] = [AbilityType.TAC, AbilityType.ENG, AbilityType.SCI]
	const SPECS: AbilityType[] = [AbilityType.INT, AbilityType.CMD, AbilityType.PIL, AbilityType.TMP, AbilityType.MWR]

	const abilitiesclone = getAbilitiesFromFilterArray(abilities)
	const abilitySpecs = [...new Set(abilitiesclone.filter(a => SPECS.includes(a.typeorspec)).map(a => a.typeorspec))]
	const abilityTypes = [...new Set(abilitiesclone.filter(a => NONSPECS.includes(a.typeorspec)).map(a => a.typeorspec))]

	// replace "any" with each of the possible ability ranks to get all permutations of the desired abilities
	const abilityPermutations = getAbilityPermutations(abilitiesclone)

	// for each ship, test the corresponding array of seats against the list of abilities
	const shipIds: number[] = []
	for (let i = 0; i < allSeats.length; i++) {

		const seats = allSeats[i] // seats for this ship

		// if this ship doesn't have the desired specs, we can skip over it
		const shipSpecs = [...new Set(seats.map(s => s[Seat.spec]))]
		const unmatchedSpecs = abilitySpecs.filter( spec => !shipSpecs.includes(spec) )
		if (unmatchedSpecs.length > 0) {
			continue
		}

		let tab = 0
		// initialize the max seats for each type/spec (including Uni) on this ship
		const maxSeats = [0, 0, 0, 0, 0, 0, 0, 0, 0]
		seats.forEach(s => {
			const [rank, type, spec] = s
			if (rank > maxSeats[type]) {
				maxSeats[type] = rank
			}
			if (spec && rank > maxSeats[spec]) {
				maxSeats[spec] = rank
			}
			tab += rank
		})

		// if the user selected more abilities than this ship can support, we can skip this ship
		if (abilities.length > tab) {
			continue
		}

		// if this ship has a universal seat, it could be used as any type requested by user
		// so overwrite the tac/eng/sci max with the uni max if applicable
		const mxu = maxSeats[AbilityType.UNDEFINED]
		if (mxu) {
			for (const aType of abilityTypes) {
				if (mxu > maxSeats[aType]) {
					maxSeats[aType] = mxu
				}
			}
		}

		// gather stats on the slot ranks for this ship
		const slotRanks = [0,0,0,0,0]
		for (const seat of seats) {
			switch (seat[Seat.rank]) {
				case 4: slotRanks[4]++; slotRanks[3]++; slotRanks[2]++; slotRanks[1]++; break
				case 3: slotRanks[3]++; slotRanks[2]++; slotRanks[1]++; break
				case 2: slotRanks[2]++; slotRanks[1]++; break
				case 1: slotRanks[1]++; break
			}
		}

		// replace "Uni" with the desired ability types to get all the permutations of the ship seats
		const seatPermutations = getSeatPermutations(seats, abilityTypes)

		// loop over the permutations and test each one.  if at least one matches, add the ship to the output
		let shipmatch = false
		for (let j = 0; !shipmatch && j < abilityPermutations.length; j++) {

			const abilityPermutation = abilityPermutations[j]

			// compare this permutation of abilities against the ship seats
			const abilityRanks = [0,0,0,0,0]
			let done = false
			for (let jj = 0; !done && jj < abilityPermutation.length; jj++) {
				const { rank, typeorspec } = abilityPermutation[jj]
				if (rank > maxSeats[typeorspec]) {
					done = true
					continue
				}
				done = (++abilityRanks[rank] > slotRanks[rank])
			}

			// exit early if this ability permutation won't work
			if (done) {
				continue
			}

			for (let k = 0; !shipmatch && k < seatPermutations.length; k++) {

				const seatPermutation = seatPermutations[k]

				// gather stats on this seat permutation (max ranks of slot type/spec)
				const maxTypes = [0,0,0,0,0,0,0,0,0]
				for (const seat of seatPermutation) {
					const [rank, type, spec] = seat
					if (rank > maxTypes[type]) {
						maxTypes[type] = rank
					}
					if (rank > maxTypes[spec]) {
						maxTypes[spec] = rank
					}
				}

				// compare abilities against max slot type/spec
				let done = false
				for (let kk = 0; !done && kk < abilityPermutation.length; kk++ ) {
					const { rank, typeorspec } = abilityPermutation[kk]
					if (rank > maxTypes[typeorspec]) {
						done = true
					}
				}

				// exit early if this seat permutation won't work
				if (done) {
					continue
				}

				if (testShip(abilityPermutation, seatPermutation)) {
					shipIds.push(i)
					shipmatch = true
				}
			}
		}
	}

	// return an array of ship ids
	return shipIds
}

// the rank of an ability could be "any" so we need to generate all of the possible permutations
function getAbilityPermutations(abilities: AbilityInterface[]) {

	const permutations: AbilityInterface[][] = []

	// start with a deep copy of original ability array
	const array = copyAbilityArray(abilities)

	// sort the abilites by rank descending but use an ASCII sort
	// this puts the "Any" abilities in the right spot and speeds up sorting at the end
	array.sort((a, b) => (String(a.rank) > String(b.rank) ? -1 : 1))

	permutations.push(array)

	// filter the list to just arrays of abilities that have at least one "Any" (ranks over 4 are encoded ranks)
	let anyAbilities = permutations.filter(array => !!array.find(ability => ability.rank > 4))

	while (anyAbilities.length > 0) {
		anyAbilities.forEach(array => {
			const abilityIndex = array.findIndex(ability => ability.rank > 4)

			// the value in the rank property of "Any" abilities can be 3 values: 123, 234, 34
			// each digit is the seat rank required for each level of the ability
			const rank = array[abilityIndex].rank

			// update the original array using the last digit as the rank
			array[abilityIndex].rank = rank % 10

			// clone the array and use the remaining rank digits for the rank
			const arrayCopy = copyAbilityArray(array)
			arrayCopy[abilityIndex].rank = ~~(rank / 10)
			permutations.push(arrayCopy)
		})
		anyAbilities = permutations.filter(array => !!array.find(ability => ability.rank > 4))
	}

	return permutations
}

// the type of a seat can be "Uni" so we need to generate all the possible permutations
function getSeatPermutations(seats: number[][], abilityTypes: AbilityType[]) {

	const permutations: number[][][] = []

	// start with a deep copy of original seat array
	const copy = copySeatArray(seats)

	// mash together the ability type codes into a single number
	const num = parseInt(abilityTypes.join(''), 10)

	// replace the uni seat types with the new number
	copy.filter(s => s[Seat.type] === AbilityType.UNDEFINED).forEach(s => s[Seat.type] = num)

	permutations.push(copy)

	// filter the list to just arrays of seats that have at least one "Uni" (types over 3 are encoded types)
	let universalSeats = permutations.filter(array => !!array.find(s => s[Seat.type] > 3))

	while (universalSeats.length > 0) {
		universalSeats.forEach(array => {
			const seatIndex = array.findIndex(s => s[Seat.type] > 3)

			// the value in the type property of "Uni" seats are mashed together type codes
			// each digit is the seat types of the abilities selected by the user
			const type = array[seatIndex][Seat.type]

			// update the original array
			array[seatIndex][Seat.type] = type % 10

			// clone the array and use the remaining type digits for the type
			const arrayCopy = copySeatArray(array)
			arrayCopy[seatIndex][Seat.type] = ~~(type / 10)
			permutations.push(arrayCopy)
		})
		universalSeats = permutations.filter(array => !!array.find(s => s[Seat.type] > 3))
	}

	return permutations
}

function testShip(abilities: AbilityInterface[], seats: number[][]) {

	// partition the abilities into spec and non-spec
	const abilitiesSpec: AbilityInterface[] = []
	const abilitiesNonSpec: AbilityInterface[] = []
	for (const ability of abilities) {
		if (ability.typeorspec > 3) {
			abilitiesSpec.push(ability)
		} else {
			abilitiesNonSpec.push(ability)
		}
	}

	// slice up the seats into ability slots
	// remove the spec from any spec slot that we definitely don't need	
	const slots: AbilitySlotInterface[] = []
	for (const seat of seats) {
		//const [rank, type, spec] = seat
		const rank = seat[0]
		const type = seat[1] as AbilityType
		const spec = seat[2] as AbilityType

		let j = rank
		while (j) {
			if (spec !== AbilityType.UNDEFINED && !abilitiesSpec.find(a => a.rank === j && a.typeorspec === spec)) {
				slots.push({rank: j, type: type, spec: AbilityType.UNDEFINED, matched: false})
			} else {
				slots.push({rank: j, type: type, spec: spec, matched: false})
			}
			j--
		}
	}

	// NOTE TO SELF: sorting the slots at this point just makes it slower

	// try to seat all the the non-spec abilities first
	for (const ability of abilitiesNonSpec) {
		const { rank, typeorspec } = ability

		// 1: search for specific slot type with no spec
		let target = slots.find( slot => !slot.matched && slot.rank === rank && slot.type === typeorspec && slot.spec === AbilityType.UNDEFINED)
		
		if (target) {
			target.matched = true
			continue // skip to the next ability as soon as we find a match
		}

		// 2: search for specific slot type with any (or no) spec
		target = slots.find( slot => !slot.matched && slot.rank === rank && slot.type === typeorspec)

		if (target) {
			target.matched = true
			continue // skip to the next ability as soon as we find a match
		}

		return false // we can exit the test entirely as soon as an ability isn't matched to a slot
	}

	// then try to seat the spec abilities
	for (const ability of abilitiesSpec) {
		const { rank, typeorspec } = ability

		// 3: search for slot with desired spec and any type
		const target = slots.find( slot => !slot.matched && slot.rank === rank && slot.spec === typeorspec)

		if (target) {
			target.matched = true
			continue  // skip to the next ability as soon as we find a match
		}

		return false  // we can exit the test entirely as soon as an ability isn't matched to a slot
	}

	return true
}

// convert an array of user-selected abilities from AbilityFilterInterface to AbilitySlotInterface
function getAbilitiesFromFilterArray(abilities: AbilityFilterInterface[]) {

	const len = abilities.length
	const copy = new Array<AbilityInterface>(len)
	let i = 0
	while (i < len) {
		const ability = abilities[i]
		copy[i] = {
			rank: ability.rank,
			typeorspec: ability.typeorspec
		}
		i++
	}

	return copy
}

function copyAbilityArray(abilities: AbilityInterface[]) {

	const len = abilities.length
	const copy = new Array<AbilityInterface>(len)
	let i = 0
	while (i < len) {
	const { rank, typeorspec } = abilities[i]
		copy[i] = {
			rank: rank,
			typeorspec: typeorspec
		}
		i++
	}

	return copy
}

function copySeatArray(seats: number[][]) {

	const len = seats.length
	const copy = new Array<number[]>(len)
	let i = 0
	while (i < len) {
		copy[i] = seats[i].slice()
		i++
	}

	return copy
}

