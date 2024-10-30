import { Navigate } from 'react-router-dom'
import { auth } from '../../types/firebase'

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const user = auth.currentUser
  if (!user) {
    return <Navigate to="/login" />
  }
  console.log(user)
  return children
}
