import { ComponentInformation, ComponentRegistrar } from './ComponentRegistrar'
import { NestedCompositionProps, CompositionInformation } from './CompositionRegistrar'

export interface RouteDataIdInfo {
    path: string
    subpath: string
    index?: number
    prefix?: string
}

export function getRouteDataId(options: RouteDataIdInfo) {
    const { path, subpath, index, prefix } = options

    const componentPath = index !== undefined ? `[${index}-${subpath}]` : `/${subpath}`
    const startPath = path === '/' ? 'homepage' : path
    const prefixPath = prefix ? `${prefix}/` : ''
    const renderPath = `${prefixPath}${startPath || ''}${componentPath}`

    return renderPath
}

export function isNestedComposition(
    component: ComponentInformation<any, any>,
): component is ComponentInformation<any, NestedCompositionProps> {
    return component.type === 'nested-composition'
}

export function flatMap<T, Mapped>(collection: T[], map: (value: T, i: number) => Mapped[]) {
    return collection.reduce((acc: Mapped[], val: T, i: number) => {
        map(val, i).forEach(v => acc.push(v))
        return acc
    }, [])
}

export function distinct<T>(arr: T[]): T[] {
    return arr.filter((el, pos) => arr.indexOf(el) === pos)
}

/** Maps an array of compositions to a flat list of components */
export function getComponentsInCompositions<LoadDataServices>(
    compositions: Array<CompositionInformation<any, any, any, any>>,
    location: Location,
    componentRegistrar: ComponentRegistrar<any, any>,
    loadDataServices: LoadDataServices,
    renderPathPrefix: string | undefined,
    renderPath: string | undefined,
) {
    return flatMap(
        compositions,
        (composition: CompositionInformation<any, any, any, any>, i: number) =>
            flatMap(Object.keys(composition.contentAreas), key =>
                contentAreas(
                    composition,
                    i,
                    key,
                    renderPath !== undefined,
                    location,
                    renderPathPrefix,
                    componentRegistrar,
                    loadDataServices,
                    renderPath,
                ),
            ),
    )
}

/** Takes an array of compositions, and expands any nested compostions
 * into a flat list of components
 */
function expandNestedCompositionsIntoComponents<LoadDataServices>(
    components: Array<ComponentInformation<any, any>>,
    location: Location,
    renderPath: string,
    componentRegistrar: ComponentRegistrar<any, any>,
    loadDataServices: LoadDataServices,
    renderPathPrefix: string | undefined,
): ContentAreaData[] {
    const contentAreasArr: ContentAreaData[] = []
    components.forEach((c, i) => {
        if (isNestedComposition(c)) {
            const props = c.props
            const result = getComponentsInCompositions(
                [props.composition],
                location,
                componentRegistrar,
                loadDataServices,
                renderPathPrefix,
                `${renderPath}[${i}]`,
            )
            result.forEach(col => contentAreasArr.push(col))
        }
    })

    return contentAreasArr
}

// map the content areas from the given composition
function contentAreas<LoadDataServices>(
    composition: CompositionInformation<any, any, any, any>,
    i: number,
    contentAreaKey: string,
    innerSearch: boolean,
    location: Location,
    renderPathPrefix: string | undefined,
    componentRegistrar: ComponentRegistrar<any, any>,
    loadDataServices: LoadDataServices,
    renderPath?: string,
): ContentAreaData[] {
    const routeDataOptions: RouteDataIdInfo = {
        path: renderPath ? renderPath : location.pathname,
        subpath: !innerSearch ? composition.type : 'nested:' + composition.type,
        index: !innerSearch ? i : undefined,
        prefix: renderPathPrefix,
    }

    const components = composition.contentAreas[contentAreaKey]

    const path = `${getRouteDataId(routeDataOptions)}/${contentAreaKey}`

    return [
        {
            renderPath: `${path}`,
            contentArea: composition.contentAreas[contentAreaKey],
        },
        ...expandNestedCompositionsIntoComponents(
            components,
            location,
            path,
            componentRegistrar,
            loadDataServices,
            renderPathPrefix,
        ),
    ]
}

export type ContentAreaData = {
    renderPath: string
    contentArea: Array<ComponentInformation<any, any>>
}
