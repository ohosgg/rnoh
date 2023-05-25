// using logger because couldn't access tracer output
import logger from "./RNOHLogger"

type TraceName = "INITIALIZATION"

const timeByTraceName: Partial<Record<TraceName, number>> = {}

export function startTrace(name: TraceName) {
  timeByTraceName[name] = new Date().getTime()
}

export function finishTrace(name: TraceName) {
  const startTime = timeByTraceName[name]
  const duration = startTime ? new Date().getTime() - startTime : -1
  logger.info(`TRACE::${name} ${duration}ms`)
}