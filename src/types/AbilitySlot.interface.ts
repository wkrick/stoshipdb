import type { AbilityType } from './Ability.type'

export interface AbilitySlotInterface {
    rank: number
    type: AbilityType
    spec: AbilityType
    matched: boolean
}
