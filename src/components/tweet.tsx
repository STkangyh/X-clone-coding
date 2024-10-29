import styled from 'styled-components'
import { ITweet } from './timeline'
import { auth, db, storage } from '../firebase'
import { deleteDoc, doc } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { useState } from 'react'
import EditModal from './edit-modal'
import { useNavigate } from 'react-router-dom'

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`
const Column = styled.div``
const Col = styled.div`
  width: 20%;
`
const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`
const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`
const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`
const DeleteButton = styled.button`
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
const EditButton = styled.button`
  margin-top: 10px;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const onDelete = async () => {
    const ok = confirm('Are you sure you want to delete this tweet?')
    if (!ok || user?.uid !== userId) return
    try {
      await deleteDoc(doc(db, 'tweets', id))
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`)
        await deleteObject(photoRef)
      }
      navigate(0)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>{tweet}</Payload>
        {user?.uid === userId ? (
          <Col>
            <DeleteButton onClick={onDelete}>Delete</DeleteButton>
            <EditButton onClick={openModal}>Edit</EditButton>
            <EditModal
              isOpen={isModalOpen}
              onClose={closeModal}
              id={id}
              tweet={tweet}
              photo={photo}
            />
          </Col>
        ) : null}
      </Column>
      <Column>{photo ? <Photo src={photo} /> : null}</Column>
    </Wrapper>
  )
}
