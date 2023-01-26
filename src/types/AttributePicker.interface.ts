import ShipInterface from "./Ship.interface"

interface AttributePickerInterface {
    name: string,
    key: keyof ShipInterface,
    operator: string,
    value: string | Array<string>
}

export default AttributePickerInterface