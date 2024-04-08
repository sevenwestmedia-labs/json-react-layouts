import { DataDefinition } from './DataLoading'
import { ComponentRegistration } from '../../json-react-layouts/src/ComponentRegistrar'
import { CompositionRegistration } from '../../json-react-layouts/src/CompositionRegistrar'

type PotentialDataDefinition<Services extends {}> = (
    | ComponentRegistration<any, any, any>
    | CompositionRegistration<any, any, any, any>
) & {
    dataDefinition?: DataDefinition<any, any, Services, any>
}

export function getDataArgs<Services extends {}>(
    registration:
        | ComponentRegistration<any, any, any>
        | CompositionRegistration<any, any, any, any>,
): DataDefinition<any, any, Services, any> | undefined {
    // Registration may or may not have a dataDefinition.
    // Assertion to undefined | DataDefinition should be safe.
    const dataDefinition = (registration as PotentialDataDefinition<Services>)?.dataDefinition
    return dataDefinition
}
