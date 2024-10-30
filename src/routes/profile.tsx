import styled from 'styled-components'
import { auth, db, storage } from '../../types/firebase'
import { useEffect, useState } from 'react'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { ITweet } from '../components/timeline'
import Tweet from '../components/tweet'
import { Input } from '../components/auth-components'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`
const Row = styled.div`
  display: flex;
  justify-content: between;
  gap: 10px;
`
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  svg {
    width: 50px;
  }
`
const AvatarImg = styled.img`
  width: 100%;
`
const AvartarInput = styled.input`
  display: none;
`
const Name = styled.span`
  font-size: 25px;
`
const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`
const UsernameEditBtn = styled.button`
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`
const CancleBtn = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`

export default function Profile() {
  const user = auth.currentUser
  const [avatar, setAvatar] = useState(user?.photoURL)
  const [tweets, setTweets] = useState<ITweet[]>([])
  const [isClicked, setIsClicked] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if (!user) return
    if (files && files.length === 1) {
      const file = files[0]
      const locationRef = ref(storage, `avatars/${user?.uid}`)
      const result = await uploadBytes(locationRef, file)
      const avatarUrl = await getDownloadURL(result.ref)
      setAvatar(avatarUrl)
      await updateProfile(user, {
        photoURL: avatarUrl,
      })
    }
  }
  const onUsernameClicked = () => {
    setIsClicked((prev) => !prev)
  }
  const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value)
  }
  const onSubmit = async () => {
    const user = auth.currentUser
    if (!user) return
    if (newUsername === '') return alert('Please give a new username')
    try {
      await updateProfile(user, {
        displayName: newUsername,
      })
      setIsClicked(false)
    } catch (e) {
      console.error(e)
    }
  }
  const fetchTweets = async () => {
    const tweetQuery = query(
      collection(db, 'tweets'),
      where('userId', '==', user?.uid),
      orderBy('createdAt', 'desc'),
      limit(25),
    )
    const snapshot = await getDocs(tweetQuery)
    const tweets = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data()
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id,
      }
    })
    setTweets(tweets)
  }
  useEffect(() => {
    fetchTweets()
  }, [])
  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <svg
            data-slot="icon"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"></path>
          </svg>
        )}
      </AvatarUpload>
      <AvartarInput
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="image/*"
      />
      {isClicked ? (
        <Row>
          <Input
            onChange={onUsernameChange}
            name="New Username"
            value={newUsername}
            placeholder="New Username"
            type="text"
            required
          />
          <UsernameEditBtn onClick={onSubmit}>
            Change your username
          </UsernameEditBtn>
          <CancleBtn onClick={onUsernameClicked}>Cancle</CancleBtn>
        </Row>
      ) : (
        <Row>
          <Name>{user?.displayName ?? 'Anonymous'}</Name>
          <UsernameEditBtn onClick={onUsernameClicked}>
            Edit
          </UsernameEditBtn>{' '}
        </Row>
      )}
      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  )
}
