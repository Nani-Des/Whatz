export function cleanFirestoreData<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => {
        if (key === 'references' && Array.isArray(value)) {
          return [
            key,
            value.map((ref) =>
              Object.fromEntries(
                Object.entries(ref as Record<string, unknown>).filter(([, v]) => v !== undefined),
              ),
            ),
          ]
        }
        return [key, value]
      }),
  ) as Partial<T>
}
