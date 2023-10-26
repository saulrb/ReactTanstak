import { Link, redirect, useNavigate, useParams, useSubmit, useNavigation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Modal from '../UI/Modal.jsx'
import EventForm from './EventForm.jsx'
import { fetchEvent, persistEvent, queryClient } from '../../util/http.js'
import ErrorBlock from '../UI/ErrorBlock.jsx'

export default function EditEvent() {
  const navigate = useNavigate()
  const { id } = useParams()
  const submit = useSubmit()
  const { state } = useNavigation()
  const { data, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    staleTime: 1000 * 60 * 60,
    cacheTime: 1000 * 60 * 60
  })

  // const { mutate } = useMutation({
  //   mutationFn: persistEvent,
  //   onMutate: async data => {
  //     const newEvent = data.event
  //     await queryClient.cancelQueries({ queryKey: ['events', id] })
  //     const previousEvent = queryClient.getQueryData(['events', id])
  //     queryClient.setQueryData(['events', id], newEvent)
  //     return { previousEvent }
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(['events', id], context.previousEvent)
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ['events', id] })
  //   }
  // })

  function handleSubmit(formData) {
    //    mutate({ event: formData, create: false, id: id })
    //    navigate('../')
    submit(formData, { method: 'PUT' })
  }

  function handleClose() {
    navigate('../')
  }
  let content

  if (!isError) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === 'submitting' ? (
          <p>Submitting ...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    )
  }
  if (isError) {
    content = (
      <ErrorBlock title={'There were an error trying to save event'} error={error?.message} />
    )
  }

  return <Modal onClose={handleClose}>{content}</Modal>
}

export const loader = ({ params }) => {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  })
}

export const action = async ({ request, params }) => {
  const formData = await request.formData()
  const updatedEventData = Object.fromEntries(formData)
  await persistEvent({ id: params.id, event: updatedEventData, create: false })
  await queryClient.invalidateQueries({ queryKey: ['events', params.id] })
  return redirect('../')
}
