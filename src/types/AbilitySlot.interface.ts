import AbilityType from "./AbilityType.enum"

interface AbilitySlotInterface {
    id: number,
    rank: number,
    type: AbilityType,
    spec: AbilityType
}

export default AbilitySlotInterface
