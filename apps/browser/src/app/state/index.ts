import { ActionReducerMap, createReducer, on } from '@ngrx/store';
import { packageSearchResultChanged, selectedPackageChanged, currentPackageLoaded, installPackage, installPackageComplete, packageJsonSelected, packageJsonUpdated, uninstallPackage, uninstallPackageComplete, packageSearchQueryChanged, packageJsonsUpdated, packageFetched, packageUpdatesFound } from './state.actions';
import { PackageSearchResult } from '../model/package-search-result.model';
import { Package } from '../model/package.model';
import { PackageUpdatesItem } from 'libs/shared/src';

export interface ApplicationState {
    packageSearchQuery: PackageSearchQuery;
    packageSearchResult: PackageSearchResult;
    selectedPackageName: string | null;
    loadedPackage: Package;
    fetchedPackage: any;
    installingPackage: boolean;
    uninstallingPackage: boolean;
    packageUpdates: { [name: string]: PackageUpdatesItem; };
    vscodeWorkspace: VSCodeWorkspace;
}

const packageSearchQueryInitialState = { searchText: '', page: 1 } as PackageSearchQuery;
const packageSearchResultInitialState = { objects: [], total: 0 } as PackageSearchResult;

export function initialState() {
    const initialStateFromVSCode: ApplicationState = vscode.getState();

    if (initialStateFromVSCode) {
        let initialWorkspaceState = initialStateFromVSCode.vscodeWorkspace;

        if (!initialWorkspaceState) // On fresh startup, workspace state is not present in state from vscode, so set it to the global workspace state.
            initialWorkspaceState = workspaceState;

        return { ...initialStateFromVSCode, vscodeWorkspace: initialWorkspaceState, installingPackage: null }
    } else {
        return {
            packageSearchQuery: packageSearchQueryInitialState,
            packageSearchResult: packageSearchResultInitialState,
            selectedPackageId: null,
            loadedPackage: null,
            installingPackage: null,
            uninstallingPackage: null,
            packageUpdates: null,
            vscodeWorkspace: workspaceState
        };
    }
}

export function packageSearchQueryReducer(state, action) {
    return createReducer(packageSearchQueryInitialState,
        on(packageSearchQueryChanged, (currentState, { value }) => {
            return { ...currentState, ...value };
        })
    )(state, action);
}

export function packageSearchResultsReducer(state, action) {
    return createReducer(packageSearchResultInitialState,
        on(packageSearchResultChanged, (currentState, { value }) => {
            return { ...currentState, ...value };
        })
    )(state, action);
}

export function selectedPackageIdReducer(state, action) {
    return createReducer(null,
        on(selectedPackageChanged, (currentState, { value }) => {
            return value;
        })
    )(state, action);
}

export function fetchedPackageReducer(state, action) {
    return createReducer(null,
        on(packageFetched, (currentState, { value }) => {
            if (!currentState)
                return value;

            return { ...currentState, ...value };
        })
    )(state, action);
}

export function currentPackageReducer(state, action) {
    return createReducer(null,
        on(currentPackageLoaded, (currentState, { value }) => {
            if (!currentState)
                return value;

            return { ...currentState, ...value };
        })
    )(state, action);
}

export function installingPackageReducer(state, action) {
    return createReducer(null,
        on(installPackage, () => true),
        on(installPackageComplete, () => false)
    )(state, action);
}

export function uninstallingPackageReducer(state, action) {
    return createReducer(null,
        on(uninstallPackage, () => true),
        on(uninstallPackageComplete, () => false)
    )(state, action);
}

export function packageUpdatesReducer(state, action) {
    return createReducer(null,
        on(packageUpdatesFound, (currentState, { value }) => {
            if (!currentState)
                return value;

            return { ...value };
        })
    )(state, action);
}

export function vscodeWorkspaceReducer(state, action) {
    const updatePackageJson = (currentState, { value }) => {
        return { ...currentState, selectedPackageJson: value }
    }

    return createReducer(null,
        on(packageJsonSelected, (currentState, { value }) => updatePackageJson(currentState, value)),
        on(packageJsonUpdated, (currentState, { value }) => updatePackageJson(currentState, { value: value })),
        on(packageJsonsUpdated, (currentState, { value }) => {
            return { ...currentState, packageJsons: value };
        })
    )(state, action);
}

export const reducers: ActionReducerMap<ApplicationState> = {
    packageSearchQuery: packageSearchQueryReducer,
    packageSearchResult: packageSearchResultsReducer,
    selectedPackageName: selectedPackageIdReducer,
    fetchedPackage: fetchedPackageReducer,
    loadedPackage: currentPackageReducer,
    installingPackage: installingPackageReducer,
    uninstallingPackage: uninstallingPackageReducer,
    packageUpdates: packageUpdatesReducer,
    vscodeWorkspace: vscodeWorkspaceReducer
};

