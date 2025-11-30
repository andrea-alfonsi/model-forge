import { UMAP } from 'umap-js';

/**
 * Interface for a 2D data array (matrix).
 * Each inner array represents an item/data point, and the values are its features.
 */
export type DataMatrix = number[][];

/**
 * Interface for the output UMAP coordinates.
 * Each inner array represents the transformed 2D point (e.g., [x, y]).
 */
export type UMAPCoordinates = number[][];

/**
 * Calculates UMAP coordinates for a scatter plot given an array of items.
 *
 * @param dataArray The input data matrix (e.g., 100 items x 10 features).
 * @param nComponents The dimension of the space to embed into (default is 2 for 2D scatter).
 * @param nNeighbors The number of neighboring points used (controls local vs global structure).
 * @param minDist The minimum distance between embedded points (controls how tightly points are clustered).
 * @returns A 2D array of the transformed coordinates (shape: [n_items, n_components]).
 */
export function calculateUmapCoordinates(
    dataArray: DataMatrix,
    nComponents: number = 2,
    nNeighbors: number = 15,
    minDist: number = 0.1,
): UMAPCoordinates {

    const config = {
        nComponents: nComponents,
        nNeighbors: nNeighbors,
        minDist: minDist,
        spread: 1.0, 
    };

    const umap = new UMAP(config);
    const umapCoordinates: UMAPCoordinates = umap.fit(dataArray);

    return umapCoordinates;
}