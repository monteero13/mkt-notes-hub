import { createServerFn } from '@tanstack/react-start'
const testFn = createServerFn({ method: 'POST' }).handler(async (ctx) => {
  console.log(ctx)
})
