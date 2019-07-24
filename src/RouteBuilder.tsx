import { ComponentInformation } from './ComponentRegistrar'
import { CompositionInformation, CompositionRegistrar } from './CompositionRegistrar'
import { createPageRenderer, Props } from './PageRenderer'
import { ComponentState, LoadArguments } from './DataLoading'
import { DataLoaderResources, DataLoaderProps } from 'react-ssr-data-loader'
import { DataLoaderActions } from 'react-ssr-data-loader/dist/data-loader'

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

    PageRenderer: React.FC<
        Props<TCompositions, TComponents, LoadDataServices, TMiddlewareProps>
    > = createPageRenderer(this)
    ComponentDataLoader: React.ReactType<
        DataLoaderProps<
            ComponentState<any>,
            DataLoaderActions<{}, ComponentState<any>>,
            LoadArguments<LoadDataServices>
        > &
            LoadArguments<LoadDataServices>
    >

    // Expects a composition registrar to be passed in
    constructor(
        public compositionRegistrar: CompositionRegistrar<
            TCompositions,
            TComponents,
            LoadDataServices,
            TMiddlewareProps
        >,
        resources: DataLoaderResources<LoadDataServices>,
    ) {
        this.ComponentDataLoader = resources.registerResource<any, LoadArguments<LoadDataServices>>(
            'component-data-loader',
            params => {
                return params.dataDefinition.loadData(params.dataDefinitionArgs, params)
            },
            ['componentRenderPath', 'dataDefinitionArgs'],
        )
    }

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

    page(...compositions: TCompositions[]): TCompositions[] {
        return compositions
    }
}
