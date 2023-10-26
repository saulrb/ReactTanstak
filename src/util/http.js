import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

export const fetchEvents = async ({ signal, searchTerm, maxTerms }) => {
  let url = 'http://localhost:3000/events'
  if (searchTerm) {
    url += `?search=${searchTerm}`
  }
  if (maxTerms) {
    if (searchTerm) {
      url += `&max=${maxTerms}`
    } else {
      url += `?max=${maxTerms}`
    }
  }

  const response = await fetch(url, { signal: signal })

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the events')
    error.code = response.status
    error.info = await response.json()
    throw error
  }

  const { events } = await response.json()

  return events
}

export const persistEvent = async eventData => {
  let url = 'http://localhost:3000/events'
  if (!eventData.create && eventData.id) {
    url += `/${eventData.id}`
  }
  const response = await fetch(url, {
    method: eventData.create ? 'POST' : 'PUT',
    body: JSON.stringify({ event: eventData.event }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) {
    const error = new Error('An error occurred while creating the event')
    error.code = response.status
    error.info = await response.json()
    throw error
  }
  const { event } = await response.json()

  return event
}

export const fetchImages = async ({ signal }) => {
  let url = 'http://localhost:3000/events/images'
  const response = await fetch(url, { signal })

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the images')
    error.code = response.status
    error.info = await response.json()
    throw error
  }

  const { images } = await response.json()

  return images
}

export const fetchEvent = async ({ signal, id }) => {
  const response = await fetch(`http://localhost:3000/events/${id}`, { signal })
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the event')
    error.code = response.status
    error.info = await response.json()
    throw error
  }
  const { event } = await response.json()
  return event
}

export const deleteEvent = async ({ id }) => {
  const response = await fetch(`http://localhost:3000/events/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    const error = new Error('An error occurred while deleting the event')
    error.code = response.status
    error.info = await response.json()
    throw error
  }

  return response.json()
}
