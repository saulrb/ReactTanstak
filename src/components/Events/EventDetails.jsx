import { Link, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js'
import { useState } from 'react'
import LoadingIndicator from '../UI/LoadingIndicator.jsx'
import ErrorBlock from '../UI/ErrorBlock.jsx'

import Header from '../Header.jsx'
import Modal from '../UI/Modal.jsx'

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    staleTime: 1000 * 60 * 60,
    cacheTime: 1000 * 60 * 60
  })

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeletion,
    error: deleteError
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' })
      navigate('/events')
    }
  })

  const handleStartDelete = () => {
    setIsDeleting(true)
  }

  const handleStopDelete = () => {
    setIsDeleting(false)
  }

  const handleDelete = async () => {
    mutate({ id })
  }

  const formattedDate = new Date(data?.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const confirmationModal = isDeleting && (
    <Modal onClose={handleStopDelete}>
      <h2>Are you sure</h2>
      <p>Do you really want to delete this event?</p>
      <p>This action cannot be undone</p>
      <div className="form-actions">
        {isPendingDeletion && (
          <>
            <div className="center">
              <LoadingIndicator />
            </div>
          </>
        )}
        {!isPendingDeletion && isErrorDeletion && (
          <ErrorBlock
            title="There was an error deleting"
            message={deleteError.info?.message || 'Failed to delete event.'}
          />
        )}
        {!isPendingDeletion && (
          <>
            {' '}
            <button className="button-text" onClick={handleStopDelete}>
              Cancel
            </button>{' '}
            <button className="button" onClick={handleDelete}>
              Delete
            </button>{' '}
          </>
        )}
      </div>
    </Modal>
  )

  return (
    <>
      {confirmationModal}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && (
        <>
          <div className="center">
            <LoadingIndicator />
          </div>
        </>
      )}
      {isError && <ErrorBlock title="An error occurred" message={error.info?.message} />}
      {!isPending && !isError && !data && <p>No event found.</p>}
      {!isPending && !isError && data && (
        <article id="event-details">
          <header>
            <h1>{data?.title}</h1>
            <nav>
              <button onClick={handleStartDelete}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img
              src={data?.image ? `http://localhost:3000/${data?.image}` : ''}
              alt={data?.title}
            />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data?.location}</p>
                <time
                  dateTime={`${data?.date} at ${data?.time}`}
                >{`${formattedDate} @ ${data?.time}`}</time>
              </div>
              <p id="event-details-description">{data?.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  )
}
