import AbilityType from "./AbilityType.enum"

interface AbilityFilterInterface {
    id: number,
    typespec: string,
    name: string,
    level: string,
    rank: number,
    type: AbilityType,
    spec: AbilityType
}

export default AbilityFilterInterface