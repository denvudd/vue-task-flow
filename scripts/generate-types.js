import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Simple .env file parser
function loadEnvFile(envPath) {
  if (!existsSync(envPath)) {
    return
  }

  const content = readFileSync(envPath, 'utf-8')
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    // Parse KEY=VALUE format
    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (match) {
      const [, key, value] = match
      // Remove quotes if present
      const unquotedValue = value.replace(/^["']|["']$/g, '')
      process.env[key.trim()] = unquotedValue.trim()
    }
  }
}

// Load environment variables from .env file if it exists
try {
  const envPath = join(rootDir, '.env.local')
  loadEnvFile(envPath)
} catch {
  // .env file might not exist, that's ok
}

const projectId = process.env.VITE_SUPABASE_PROJECT_ID
const supabaseUrl = process.env.VITE_SUPABASE_URL

if (!projectId && !supabaseUrl) {
  console.error('Error: VITE_SUPABASE_PROJECT_ID or VITE_SUPABASE_URL must be set in .env file')
  process.exit(1)
}

const typesDir = join(rootDir, 'src', 'types')
const typesFile = join(typesDir, 'supabase.ts')

// Create types directory if it doesn't exist
mkdirSync(typesDir, { recursive: true })

try {
  let command

  if (projectId) {
    // Use project ID if available
    command = `npx supabase gen types typescript --project-id ${projectId}`
  } else if (supabaseUrl) {
    // Extract project ID from URL if not provided
    const urlProjectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
    if (urlProjectId) {
      command = `npx supabase gen types typescript --project-id ${urlProjectId}`
    } else {
      throw new Error('Could not extract project ID from VITE_SUPABASE_URL')
    }
  } else {
    throw new Error('Neither VITE_SUPABASE_PROJECT_ID nor valid VITE_SUPABASE_URL found')
  }

  console.log('Generating Supabase types...')
  const types = execSync(command, { encoding: 'utf-8', cwd: rootDir })

  writeFileSync(typesFile, types, 'utf-8')
  console.log(`Types generated successfully at ${typesFile}`)
} catch (error) {
  console.error('Error generating types:', error.message)
  // Create a placeholder types file
  const placeholderTypes = `// Placeholder types file
// Run 'npm run supabase:types' to generate actual types
// Make sure VITE_SUPABASE_PROJECT_ID or VITE_SUPABASE_URL is set in .env.local file

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {}
    Views: {}
    Functions: {}
    Enums: {}
  }
}
`
  writeFileSync(typesFile, placeholderTypes, 'utf-8')
  console.error(
    'Created placeholder types file. Please run the command after setting up your Supabase project.',
  )
  process.exit(1)
}
