import ShipInterface from "./Ship.interface"

interface ColumnFilterInterface {
    id: number,
    label: string,
    key: keyof ShipInterface
}

export default ColumnFilterInterface