import AbilityType from "./AbilityType.enum"

interface AbilityFilterInterface {
    id: number,
    typespec: string,
    name: string,
    level: string,
    rank: number,
    typeorspec: AbilityType
}

export default AbilityFilterInterface