interface FirestoreSetupBannerProps {
  message: string
}

export default function FirestoreSetupBanner({ message }: FirestoreSetupBannerProps) {
  const isSetupIssue = /firestore|database|permission denied/i.test(message)

  if (!isSetupIssue) {
    return (
      <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-4 text-sm text-neutral-300">
        {message}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-600 bg-neutral-900 p-5">
      <p className="font-medium text-white">Database setup required</p>
      <p className="mt-2 text-sm text-neutral-400">{message}</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-400">
        <li>
          Go to{' '}
          <a
            href="https://console.firebase.google.com/project/whatz-1a/firestore"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline"
          >
            Firebase Console → Firestore
          </a>
        </li>
        <li>Click <strong className="text-neutral-200">Create database</strong> (Production mode is fine)</li>
        <li>Paste and publish rules from <code className="text-neutral-200">firestore.rules</code> in your project</li>
        <li>Enable Google sign-in under Authentication → Sign-in method</li>
        <li>Refresh this page</li>
      </ol>
    </div>
  )
}
