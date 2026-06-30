const required = ['MONGODB_URI', 'JWT_SECRET']

export const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]?.trim())
  if (missing.length) {
    console.error('Missing required environment variables:', missing.join(', '))
    console.error(
      'Set them in Render Dashboard → your backend service → Environment, then redeploy.'
    )
    process.exit(1)
  }
}
