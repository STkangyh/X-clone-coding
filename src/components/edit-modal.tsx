import styled from 'styled-components'
import { useState } from 'react'
import { auth, db, storage } from '../firebase'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'

interface WrapperProps {
  isOpen: boolean
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  id: string
  tweet: string
  photo: string
}

const Wrapper = styled.div<WrapperProps>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
`
const ModalContent = styled.div`
  background-color: black;
  padding: 20px 30px;
  border: 1px solid #1d9bf0;
  border-radius: 10px;
  width: 50%;
  text-align: center;
`
const Head = styled.p`
  font-weight: 600;
  font-size: 18px;
`
const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`
const BtnWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`
const Textarea = styled.textarea`
  diplay: felx;
  align-items: center;
  margin-top: 20px;
  border: 2px solid white;
  padding: 30px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: #2f2f2f;
  width: 100%;
  resize: none;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`
const AttachFileButton = styled.label`
  background-color: white;
  color: #1d9bf0;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 10px 55px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  margin-right: 20px;
`
const AttachFileInput = styled.input`
  display: none;
`
const EditButton = styled.button`
  background-color: #1d9bf0;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 10px 55px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  margin-right: 20px;
`
const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const PhotoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  svg {
    width: 30px;
    fill: white;
  }
`
const BtnDeletePhoto = styled.button`
  background-color: black;
  border: none;
`

export default function EditModal({
  isOpen,
  onClose,
  id,
  tweet,
  photo,
}: ModalProps) {
  const user = auth.currentUser
  const [isLoading, setLoading] = useState(false)
  const [newFile, setNewFile] = useState<File | null>(null)
  const [newTweet, setNewTweet] = useState(tweet)
  const [newPhoto, setNewPhoto] = useState(photo)

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewTweet(e.target.value)
  }
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e?.target
    if (files && files.length === 1) {
      if (files[0].size < 1 * 1024 * 1024) {
        setNewFile(files[0])
      } else {
        alert('The size of the file is too heavy')
      }
    } else {
      console.log('No new file or file is not sole')
    }
  }
  const onDelete = async () => {
    const ok = confirm('Are you sure you want to delete this tweet?')
    if (!ok || !user) return
    try {
      if (photo) {
        await updateDoc(doc(db, 'tweets', id), {
          photo: null,
        })
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`)
        await deleteObject(photoRef)
      }
    } catch (e) {
      console.log(e)
    }
  }
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user || isLoading || newTweet === '' || newTweet.length > 180) return

    try {
      setLoading(true)
      const tweetRef = doc(db, 'tweets', id)
      await updateDoc(tweetRef, {
        tweet: newTweet,
      })

      if (newFile) {
        if (photo) {
          const originalPhotoRef = ref(storage, `tweets/${user.uid}/${id}`)
          await deleteObject(originalPhotoRef)
        }

        const locationRef = ref(storage, `tweets/${user.uid}/${id}`)
        const result = await uploadBytes(locationRef, newFile)
        const url = await getDownloadURL(result.ref)

        await updateDoc(tweetRef, {
          photo: url,
        })
        setNewPhoto(url)
      }
      setNewTweet('')
      setNewFile(null)
      setLoading(false)
      onClose()
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }
  if (!isOpen) return null
  return (
    <Wrapper isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Head>Edit Tweet</Head>
        <Form onSubmit={onSubmit}>
          <Row>
            <Textarea
              rows={5}
              maxLength={1800}
              onChange={onChange}
              value={newTweet}
              placeholder={tweet}
              required
            />
            {photo ? (
              <PhotoWrapper>
                <BtnDeletePhoto onClick={onDelete}>
                  <svg
                    data-slot="icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path>
                  </svg>
                </BtnDeletePhoto>
                <Photo src={newPhoto} />
              </PhotoWrapper>
            ) : null}
          </Row>
          <BtnWrapper>
            <AttachFileButton htmlFor={`editFile${id}`}>
              {newFile
                ? 'New Photo added ✅'
                : photo
                  ? 'Change Photo'
                  : 'Add photo'}
            </AttachFileButton>
            <AttachFileInput
              onChange={onFileChange}
              type="file"
              id={`editFile${id}`}
              accept="image/*"
            />
            <EditButton type="submit">
              {isLoading ? 'Editing...' : 'Edit Tweet'}
            </EditButton>
          </BtnWrapper>
        </Form>
      </ModalContent>
    </Wrapper>
  )
}
