interface DataPoint {
    date: string
    value: number
}



/**
 * @todo Rename interface
 * @todo Rename methods
 * Interface for perfomance charts graph.
 * Given dates gets datapoints appropriate to timeline.
 * Something like this should be made to get data points
 * at least until backend is made this will do
 */
interface chart {
    portfolioId: string

    /**
     * 
     * @param days Amount of days worth of data points requested
     * @returns {DataPoint[]} Array of data points starting from most recent
     */
    getDataPoints(days: number) : DataPoint[]

    /**
     * 
     * @param date Date of datapoint requested
     * @returns {DataPoint} Data point for specified day
     */
    getDataPoint(date: string) : DataPoint[]
}