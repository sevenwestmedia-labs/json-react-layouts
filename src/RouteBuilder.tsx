import { ComponentInformation } from './ComponentRegistrar'
import { CompositionInformation, CompositionRegistrar } from './CompositionRegistrar'
import { createCompositionsRenderer, Props } from './CompositionsRenderer'

// TODO Route builder is a poor name for this.
// It's more the API once you have finished registering everything and you want to use it..

/**
 * This class is simply used to get better typescript completion and errors targeted to where they occur
 * its used to build up the route but also to render it
 */
export class RouteBuilder<
    TCompositions extends CompositionInformation<any, TComponents, any, any>,
    TComponents extends ComponentInformation<any> & TMiddlewareProps,
    LoadDataServices,
    TMiddlewareProps extends {}
> {
    _compositionType!: TCompositions
    _componentType!: TComponents & TMiddlewareProps
    _contentAreaType!: TComponents[]

    CompositionsRenderer: React.FC<
        Props<TCompositions, TComponents, LoadDataServices, TMiddlewareProps>
    > = createCompositionsRenderer(this)

    // Expects a composition registrar to be passed in
    constructor(
        public compositionRegistrar: CompositionRegistrar<
            TCompositions,
            TComponents,
            LoadDataServices,
            TMiddlewareProps
        >,
    ) {}

    component(component: TComponents & TMiddlewareProps) {
        return component
    }

    /** Nested compositions are special components
     * You need to use this function to create them then pass them as a component
     */
    nestedComposition(composition: TCompositions): ComponentInformation<any, any> {
        return {
            type: 'nested-composition',
            props: { composition },
        }
    }

    contentArea(...components: TComponents[]): Array<ComponentInformation<any>> {
        return components
    }

    composition(composition: TCompositions) {
        return composition
    }

    compositions(...compositions: TCompositions[]): TCompositions[] {
        return compositions
    }
}
