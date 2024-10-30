import { useState } from 'react'
import {
  Error,
  Form,
  Input,
  Title,
  Wrapper,
} from '../components/auth-components'
import { FirebaseError } from 'firebase/app'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../types/firebase'
import { Link } from 'react-router-dom'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [issubmitted, setIssubmitted] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIssubmitted(false)
    if (email === '') return
    try {
      await sendPasswordResetEmail(auth, email)
        .then(() => setIssubmitted(true))
        .catch((e) => {
          console.log(e)
        })
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message)
      }
    }
  }
  return (
    <Wrapper>
      <Title>Finding My X Account</Title>
      If you want to change your password, please write the email connected with
      your account.
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="Email"
          type="email"
          required
        />
        <Input type="submit" value="find password" />
      </Form>
      <button>
        <Link to="/">Home</Link>
      </button>
      {error !== '' ? <Error>{error}</Error> : null}
      {issubmitted ? 'Check your email' : error}
    </Wrapper>
  )
}
