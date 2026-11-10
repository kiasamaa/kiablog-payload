import 'dotenv/config'

import { createLocalReq, getPayload } from 'payload'

import config from '../src/payload.config'
import { seed } from '../src/endpoints/seed'

const run = async () => {
  const payload = await getPayload({ config })
  const req = await createLocalReq({}, payload)

  await seed({ payload, req })

  payload.logger.info('Seed finished.')
  process.exit(0)
}

void run()
