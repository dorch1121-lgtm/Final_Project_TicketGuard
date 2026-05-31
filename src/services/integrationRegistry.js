export const futureIntegrations = {
  supabaseAuth: {
    status: 'planned',
    purpose: 'User registration, login, and free-report eligibility.',
    envKeys: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
  },
  supabaseDatabase: {
    status: 'planned',
    purpose: 'Store reports, analysis results, missing details, and manual review status.',
    tables: ['profiles', 'reports', 'analysis_results', 'manual_reviews', 'payments'],
  },
  supabaseStorage: {
    status: 'planned',
    purpose: 'Store uploaded PDF files before OCR and AI analysis.',
    buckets: ['ticket-reports'],
  },
  documentAnalysis: {
    status: 'mocked',
    purpose: 'Replace mock analysis with OCR and AI document review.',
    expectedInput: 'PDF file metadata and extracted text',
  },
  paymentProvider: {
    status: 'planned',
    purpose: 'Charge once after the free first report is used.',
    expectedEvents: ['payment_started', 'payment_succeeded', 'payment_failed'],
  },
  vercelDeployment: {
    status: 'planned',
    purpose: 'Host the Vite frontend and provide environment variables.',
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
  },
};

export function getFutureIntegrations() {
  return futureIntegrations;
}
