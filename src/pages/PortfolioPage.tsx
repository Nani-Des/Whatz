import { useParams } from 'react-router-dom'
import Home from './Home'

export default function PortfolioPage() {
  const { username } = useParams<{ username: string }>()
  return <Home portfolioUsername={username} />
}
