import AbilityType from "./AbilityType.enum"

interface AbilitySlotInterface {
    rank: number
    type: AbilityType
    spec: AbilityType
    matched: boolean
}

export default AbilitySlotInterface
