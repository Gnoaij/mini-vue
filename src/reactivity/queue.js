const jobQueue = new Set()

const resolvedPromise = Promise.resolve()

let isFlushing = false

function flushJob() {
  if (isFlushing) {
    return
  }

  isFlushing = true

  resolvedPromise
    .then(() => jobQueue.forEach((job) => job()))
    .finally(() => {
      isFlushing = false

      jobQueue.clear()
    })
}

function queueJob(job) {
  jobQueue.add(job)

  flushJob()
}

export { queueJob }
