import '@total-typescript/ts-reset'
import { Button, Center } from '@chakra-ui/react'
import { z } from 'zod'
import { Layout } from './components/Layout'
import { useSearchParams } from './useSearchParams'

const history = {
  push: console.log,
}

const schema = z.object({
  array: z
    .array(z.number({ coerce: true }).or(z.string()))
    .optional()
    .catch(undefined),
  limit: z.number({ coerce: true }).optional().catch(undefined),
  search: z.string({ coerce: true }).optional().catch(undefined),
  stringNumber: z.string({ coerce: true }).optional().catch(undefined),
})

function App() {
  const [params, { append }] = useSearchParams({
    schema,
    onUpdate: (search) => history.push({ search }),
  })

  return (
    <Layout>
      <Center flexDir="column" gap={8}>
        <pre>{JSON.stringify(params, null, 2)}</pre>
        <Button onClick={() => append({ limit: 857 })}>Update</Button>
      </Center>
    </Layout>
  )
}

export default App
