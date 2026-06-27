export function getFirestoreErrorMessage(error: unknown): string {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : error instanceof Error
        ? error.message
        : ''

  if (/database.*not found|NOT_FOUND.*database/i.test(message)) {
    return 'Firestore is not set up yet. Open Firebase Console → Build → Firestore Database → Create database, then refresh this page.'
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code

    switch (code) {
      case 'permission-denied':
        return 'Permission denied. Publish the rules in firestore.rules via Firebase Console → Firestore → Rules.'
      case 'failed-precondition':
        return 'Database index required. The app will retry with a simpler query.'
      case 'unavailable':
        return 'Firestore is temporarily unavailable. Please try again.'
      case 'not-found':
        if (/database/i.test(message)) {
          return 'Firestore database not found. Create it in Firebase Console → Firestore Database.'
        }
        return 'Document not found.'
      default:
        return message || `Firestore error (${code})`
    }
  }

  if (message) return message
  return 'An unexpected database error occurred.'
}
