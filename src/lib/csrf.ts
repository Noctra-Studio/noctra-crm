import Tokens from 'csrf'

const tokens = new Tokens()
const CSRF_SECRET = process.env.CSRF_SECRET!

export function generateCsrfToken(): string {
  if (!CSRF_SECRET) {
    throw new Error('CSRF_SECRET is not defined in environment variables')
  }
  return tokens.create(CSRF_SECRET)
}

export function validateCsrfToken(token: string): boolean {
  if (!CSRF_SECRET) {
    throw new Error('CSRF_SECRET is not defined in environment variables')
  }
  return tokens.verify(CSRF_SECRET, token)
}
