import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { persistEvent, queryClient } from '../../util/http.js'
import Modal from '../UI/Modal.jsx'
import EventForm from './EventForm.jsx'
import ErrorBlock from '../UI/ErrorBlock.jsx'
import LoadingIndicator from '../UI/LoadingIndicator.jsx'

export default function NewEvent() {
  const navigate = useNavigate()
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: persistEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      navigate('/events')
    }
  })

  function handleSubmit(formData) {
    mutate({ event: formData, create: true, id: null })
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && <LoadingIndicator />}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="There was an error creating"
          message={error.info?.message || 'Invalid data, please check your input ...'}
        />
      )}
    </Modal>
  )
}
