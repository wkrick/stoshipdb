import type { AbilityType } from './Ability.type'

export interface AbilityFilterInterface {
    id: number
    typespec: string
    name: string
    level: string
    rank: number
    typeorspec: AbilityType
    displayString: string
}
