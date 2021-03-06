import ShipInterface from "./Ship.interface"

interface AttributeFilterInterface {
    id: number,
    name: string,
    key: keyof ShipInterface,
    operator: string,
    value: Array<string>
}

export default AttributeFilterInterface