export interface VisitRecord {
  id: string
  path: string
  postId: string | null
  createdAt: Date
}

export interface VisitStats {
  totalVisits: number
  homeVisits: number
  postVisits: number
  visitsByPost: Record<string, number>
  visitsLast7Days: { date: string; count: number }[]
  recentVisits: VisitRecord[]
}
