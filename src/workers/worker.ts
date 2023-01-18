import AbilityFilterInterface from '../types/AbilityFilter.interface'
import ShipInterface from '../types/Ship.interface'
import ShipSeatsInterface from '../types/ShipSeats.interface'
import AbilityInterface from '../types/Ability.interface'
import AbilitySlotInterface from '../types/AbilitySlot.interface'
import SeatInterface from '../types/Seat.interface'
import AbilityType from '../types/AbilityType.enum'
import allShipsJSON from '../assets/shipdata.json'
import allSeatsJSON from '../assets/seatdata.json'

self.addEventListener('message', e => {
	const start = Date.now()
	let shipIds = filterShips(e.data)
	const stop = Date.now()
	//console.log(`Filtering took ${(stop - start)/1000} seconds`)
	self.postMessage(shipIds)
})

const allShips = allShipsJSON as ShipInterface[]
const allSeats = allSeatsJSON as ShipSeatsInterface[]

const filterShips = (abilities: AbilityFilterInterface[] ) => {
	
	let ships = allShips 

	if (abilities.length === 0) {
		// return an array of the ship ids
		return ships.map(s => s.id)
	}

	const NONSPECS = [AbilityType.TAC, AbilityType.ENG, AbilityType.SCI]
	const SPECS = [AbilityType.INT, AbilityType.CMD, AbilityType.PIL, AbilityType.TMP, AbilityType.MWR]

	const abilitiesclone = getAbilitiesFromFilterArray(abilities)
	const abilitySpecs = [...new Set(abilitiesclone.filter(a => SPECS.includes(a.typeorspec)).map(a => a.typeorspec))]
	const abilityTypes = [...new Set(abilitiesclone.filter(a => NONSPECS.includes(a.typeorspec)).map(a => a.typeorspec))]

	// replace "any" with each of the possible ability ranks to get all permutations of the desired abilities
	const abilityPermutations = getAbilityPermutations(abilitiesclone)

	// for each ship, test the corresponding array of seats against the list of abilities
	const shipIds: number[] = []
	for (let i = 0; i < ships.length; i++) {

		const ship = ships[i]

		// if the user selected more abilities than this ship can support, then skip it
		if (abilities.length > ship.tab) {
			continue
		}

		const seats = allSeats[ship.id].seats // seats for this ship

		// if this ship doesn't have the desired specs, we can skip over it
		const shipSpecs = [...new Set(seats.map(s => s.spec))]
		const unmatchedSpecs = abilitySpecs.filter( spec => !shipSpecs.includes(spec) )
		if (unmatchedSpecs.length > 0) {
			continue
		}

		// initialize the max seats for each type/spec (including Uni) on this ship
		const maxSeats = [0, ship.mxt, ship.mxe, ship.mxs, ship.mxi, ship.mxc, ship.mxp, ship.mxo, ship.mxm]

		// if this ship has a universal seat, it could be used as any type requested by user
		// so overwrite the tac/eng/sci max with the uni max if applicable
		if (ship.mxu) {
			for (let ii = 0; ii < abilityTypes.length; ii++) {
				const aType = abilityTypes[ii]
				if (ship.mxu > maxSeats[aType]) {
					maxSeats[aType] = ship.mxu
				}
			}
		}

		// gather stats on the slot ranks for this ship
		const slotRanks = [0,0,0,0,0]
		for (let ii = 0; ii < seats.length; ii++) {
			switch (seats[ii].rank) {
				case 4: slotRanks[4]++
				case 3: slotRanks[3]++
				case 2: slotRanks[2]++
				case 1: slotRanks[1]++
			}
		}

		// replace "Uni" with the desired ability types to get all the permutations of the ship seats
		let seatPermutations = getSeatPermutations(seats, abilityTypes)

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
				for (let kk = 0; kk < seatPermutation.length; kk++) {
					const { rank, type, spec } = seatPermutation[kk]
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
					shipIds.push(ship.id)
					shipmatch = true
				}
			}
		}
	}

	// return an array of ship ids
	return shipIds
}

// the rank of an ability could be "any" so we need to generate all of the possible permutations
const getAbilityPermutations = (abilities: AbilityInterface[]) => {

	let permutations: AbilityInterface[][] = []

	// start with a deep copy of original ability array
	let array = copyAbilityArray(abilities)

	// sort the abilites by rank descending but use an ASCII sort
	// this puts the "Any" abilities in the right spot and speeds up sorting at the end
	array.sort((a, b) => (a.rank+'' > b.rank+'' ? -1 : 1))

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
const getSeatPermutations = (seats: SeatInterface[], abilityTypes: AbilityType[]) => {

	let permutations: SeatInterface[][] = []

	// start with a deep copy of original seat array
	const copy = copySeatArray(seats)

	// mash together the ability type codes into a single number
	const num = parseInt(abilityTypes.join(''), 10)

	// replace the uni seat types with the new number
	copy.filter(s => s.type === AbilityType.UNDEFINED).forEach(s => s.type = num)

	permutations.push(copy)

	// filter the list to just arrays of seats that have at least one "Uni" (types over 3 are encoded types)
	let universalSeats = permutations.filter(array => !!array.find(seat => seat.type > 3))

	while (universalSeats.length > 0) {
		universalSeats.forEach(array => {
			const seatIndex = array.findIndex(seat => seat.type > 3)

			// the value in the type property of "Uni" seats are mashed together type codes
			// each digit is the seat types of the abilities selected by the user
			const type = array[seatIndex].type

			// update the original array
			array[seatIndex].type = type % 10

			// clone the array and use the remaining type digits for the type
			const arrayCopy = copySeatArray(array)
			arrayCopy[seatIndex].type = ~~(type / 10)
			permutations.push(arrayCopy)
		})
		universalSeats = permutations.filter(array => !!array.find(seat => seat.type > 3))
	}

	return permutations
}

const testShip = (abilities: AbilityInterface[], seats: SeatInterface[]) => {

	// partition the abilities into spec and non-spec
	const abilitiesSpec: AbilityInterface[] = []
	const abilitiesNonSpec: AbilityInterface[] = []
	for (let i = 0; i < abilities.length; i++) {
		const ability = abilities[i]
		if (ability.typeorspec > 3) {
			abilitiesSpec.push(ability)
		} else {
			abilitiesNonSpec.push(ability)
		}
	}

	// slice up the seats into ability slots
	// remove the spec from any spec slot that we definitely don't need	
	const slots: AbilitySlotInterface[] = []
	for (let i = 0; i < seats.length; i++) {
		const { rank, type, spec } = seats[i]
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
	for (let i = 0; i < abilitiesNonSpec.length; i++) {
		const { rank, typeorspec } = abilitiesNonSpec[i]

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
	for (let i = 0; i < abilitiesSpec.length; i++) {
		const { rank, typeorspec } = abilitiesSpec[i]

		// 3: search for slot with desired spec and any type
		let target = slots.find( slot => !slot.matched && slot.rank === rank && slot.spec === typeorspec)

		if (target) {
			target.matched = true
			continue  // skip to the next ability as soon as we find a match
		}

		return false  // we can exit the test entirely as soon as an ability isn't matched to a slot
	}

	return true
}

// convert an array of user-selected abilities from AbilityFilterInterface to AbilitySlotInterface
const getAbilitiesFromFilterArray = (abilities: AbilityFilterInterface[]) => {

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

const copyAbilityArray = (abilities: AbilityInterface[]) => {

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

const copySeatArray = (seats: SeatInterface[]) => {

	const len = seats.length
	const copy = new Array<SeatInterface>(len)
	let i = 0
	while (i < len) {
		const { rank, type, spec } = seats[i]
		copy[i] = {
			rank: rank,
			type: type,
			spec: spec
		}
		i++
	}

	return copy
}
