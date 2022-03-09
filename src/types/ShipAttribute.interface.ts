import ShipInterface from './Ship.interface'

interface ShipAttributeInterface {
    label: string,
    key: keyof ShipInterface
}

export default ShipAttributeInterface