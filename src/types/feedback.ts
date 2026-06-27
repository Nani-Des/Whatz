export interface Feedback {
  id: string
  postId: string
  postTitle: string
  name: string
  email: string
  message: string
  createdAt: Date
}

export interface FeedbackInput {
  postId: string
  postTitle: string
  name: string
  email: string
  message: string
}
