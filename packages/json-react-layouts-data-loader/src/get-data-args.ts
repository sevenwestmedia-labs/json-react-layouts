import { LayoutApi } from 'json-react-layouts'
import { DataDefinition } from './DataLoading'

export function getComponentDataArgs<Services extends object>(
    layout: LayoutApi<any, any, any, any, Services>,
    componentType: string,
): DataDefinition<any, any, Services> | undefined {
    const componentDataDefinition = layout.componentRegistrations.get(componentType)

    // This can be undefined
    if (!componentDataDefinition) {
        return
    }
    const dataDefinition = (componentDataDefinition as any).dataDefinition

    return dataDefinition
}
