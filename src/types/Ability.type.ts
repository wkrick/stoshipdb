export const AbilityType = {
    UNDEFINED: 0,
    TAC: 1,
    ENG: 2,
    SCI: 3,
    INT: 4,
    CMD: 5,
    PIL: 6,
    TMP: 7,
    MWR: 8,
} as const;

export type AbilityType  = typeof AbilityType[keyof typeof AbilityType]



