import React, { useEffect } from 'react'
import dayjs from 'dayjs'
import tw from 'twin.macro'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import { gql, useLazyQuery, useSubscription } from '@apollo/client'
// Redux Action
import {
  getSelfContactBook,
  createSelfContactBook,
} from '../../redux/action/userAction'
import {
  getSelfEventList,
  getOtherEventList,
  getPubSubEventNew,
  getPubSubSelfEventNew,
  getPubSubEventUpdate,
  getPubSubSelfEventUpdate,
  getPubSubEventDelete,
  getPubSubSelfEventDelete,
} from '../../redux/action/eventAction'

const MainWrapper = ({ children }) => {
  const dispatch = useDispatch()

  const userSignIn = useSelector((state) => state.userSignIn)
  const { user } = userSignIn

  const calenderInfo = useSelector((state) => state.calenderInfo)
  const { monthIndex } = calenderInfo

  const [getSelfContactBookListItem, { data: selfContactData }] = useLazyQuery(
    GET_SELF_CONTACT_BOOK,
    {
      context: {
        headers: {
          Authorization: `Bearer${' '}${user && user.token}`,
        },
      },
    }
  )

  const [getSelfEventListItem, { data: selfListData }] = useLazyQuery(
    GET_SELF_EVENT_LIST,
    {
      context: {
        headers: {
          Authorization: `Bearer${' '}${user && user.token}`,
        },
      },
    }
  )

  const [getAllEventListItem, { data: allListData }] = useLazyQuery(
    GET_ALL_EVENT_LIST,
    {
      context: {
        headers: {
          Authorization: `Bearer${' '}${user && user.token}`,
        },
      },
    }
  )

  const { data: subNewEvent } = useSubscription(CREATED_EVENT_SUBSCRIPTION)

  const { data: subUpdateEvent } = useSubscription(UPDATED_EVENT_SUBSCRIPTION)

  const { data: subDeleteEvent } = useSubscription(DELETED_EVENT_SUBSCRIPTION)

  const { data: subNewCustomer } = useSubscription(
    CREATED_CUSTOMER_SUBSCRIPTION
  )

  const { data: subNewDirectCustomer } = useSubscription(
    CREATED_DIRECT_CUSTOMER_SUBSCRIPTION
  )

  const handleGetSelectedMonthEvent = () => {
    // Get selected month info
    const thisyear = dayjs().year()
    const thisMonthDays = dayjs(dayjs().month(monthIndex)).daysInMonth()
    const thisMonthFirstDayIndex = dayjs(
      new Date(thisyear, monthIndex, 1)
    ).day()
    // Get selected month last and current overdue day in calender
    const thisMonthLastOverDue = thisMonthDays + thisMonthFirstDayIndex
    const thisMonthOverDue =
      thisMonthLastOverDue > 35
        ? 42 - thisMonthLastOverDue
        : 35 - thisMonthLastOverDue
    // Get Start and End Date of selected month calender
    const thisMonthStartQueryDay = new Date(
      thisyear,
      monthIndex,
      -thisMonthFirstDayIndex + 1
    )
    const thisMonthLastQueryDay = new Date(
      thisyear,
      monthIndex + 1,
      thisMonthOverDue + 1
    )

    getSelfContactBookListItem()

    if (user.isManager) {
      getAllEventListItem({
        variables: {
          startDate: dayjs(thisMonthStartQueryDay).format(
            'YYYY-MM-DDTHH:mm:ss'
          ),
          endDate: dayjs(thisMonthLastQueryDay).format('YYYY-MM-DDTHH:mm:ss'),
        },
      })
    }

    getSelfEventListItem({
      variables: {
        startDate: dayjs(thisMonthStartQueryDay).format('YYYY-MM-DDTHH:mm:ss'),
        endDate: dayjs(thisMonthLastQueryDay).format('YYYY-MM-DDTHH:mm:ss'),
      },
    })
  }

  const handleGetSubscriptionNewEvent = () => {
    if (subNewEvent && subNewEvent.eventCreated) {
      const TempArr = { ...subNewEvent.eventCreated }

      // If user Not manager, check subscription event is created by him
      if (TempArr.user.id === user.id) {
        dispatch(getPubSubSelfEventNew(TempArr))
      }
      // If user is manager, get and push to all other user event list
      else if (user.isManager) {
        dispatch(getPubSubEventNew(TempArr))
      }
      // Else user not manager, ignore the event add by other
    }

    return
  }

  const handleGetSubscriptionUpdateEvent = () => {
    if (subUpdateEvent && subUpdateEvent.eventUpdated) {
      const TempArr = { ...subUpdateEvent.eventUpdated }

      // If user Not manager, check subscription event is created by him
      if (TempArr.user.id === user.id) {
        dispatch(getPubSubSelfEventUpdate(TempArr))
      }
      // If user is manager, get and push to all other user event list
      else if (user.isManager) {
        dispatch(getPubSubEventUpdate(TempArr))
      }
      // Else user not manager, ignore the event add by other
    }

    return
  }

  const handleGetSubscriptionDeleteEvent = () => {
    if (subDeleteEvent && subDeleteEvent.eventDeleted) {
      const evtId = subDeleteEvent.eventDeleted.id
      const userId = subDeleteEvent.eventDeleted.user.id

      if (userId === user.id) {
        dispatch(getPubSubSelfEventDelete(evtId))
      } else if (user.isManager) {
        dispatch(getPubSubEventDelete(evtId))
      }
    }

    return
  }

  useEffect(() => {
    if (user) handleGetSelectedMonthEvent()
  }, [monthIndex, user])

  // Get Basic Data UseEffect
  useEffect(() => {
    if (selfListData) {
      dispatch(getSelfEventList(selfListData.getSelfEvent))
    }

    if (allListData) {
      dispatch(getOtherEventList(allListData.getAllEvent))
    }

    if (selfContactData) {
      dispatch(getSelfContactBook(selfContactData.getSelfCustomers))
    }
  }, [selfListData, allListData, selfContactData])

  // Get Subscription UseEffect
  useEffect(() => {
    if (subNewEvent) handleGetSubscriptionNewEvent()
    if (subUpdateEvent) handleGetSubscriptionUpdateEvent()
    if (subDeleteEvent) handleGetSubscriptionDeleteEvent()
  }, [subNewEvent, subUpdateEvent, subDeleteEvent])

  useEffect(() => {
    if (subNewCustomer) {
      dispatch(createSelfContactBook(subNewCustomer.customerCreated))
    }
    if (subNewDirectCustomer) {
      dispatch(createSelfContactBook(subNewDirectCustomer.eventCustomerCreated))
    }
  }, [subNewCustomer, subNewDirectCustomer])

  return <MainContainer>{children}</MainContainer>
}

const GET_SELF_CONTACT_BOOK = gql`
  query getSelfCustomers {
    getSelfCustomers {
      id
      personal
      company
      position
      personalcontact
      companycontact
      address
    }
  }
`

const GET_SELF_EVENT_LIST = gql`
  query getSelfEvent($startDate: String!, $endDate: String!) {
    getSelfEvent(startDate: $startDate, endDate: $endDate) {
      id
      title
      customer {
        cusId
        personal
        position
        company
      }
      description
      planDate
      compDate
      isCompleted
      isRescheduled
      isCancelled
      remark
    }
  }
`

const GET_ALL_EVENT_LIST = gql`
  query getAllEvent($startDate: String!, $endDate: String!) {
    getAllEvent(startDate: $startDate, endDate: $endDate) {
      id
      user {
        id
        username
      }
      title
      customer {
        cusId
        personal
        position
        company
      }
      description
      planDate
      compDate
      isCompleted
      isRescheduled
      isCancelled
      remark
    }
  }
`

const CREATED_EVENT_SUBSCRIPTION = gql`
  subscription {
    eventCreated {
      id
      user {
        id
        username
      }
      title
      customer {
        cusId
        personal
        position
        company
      }
      description
      planDate
      compDate
      isCompleted
      isRescheduled
      isCancelled
      remark
    }
  }
`

const UPDATED_EVENT_SUBSCRIPTION = gql`
  subscription {
    eventUpdated {
      id
      user {
        id
        username
      }
      title
      customer {
        cusId
        personal
        position
        company
      }
      description
      planDate
      compDate
      isCompleted
      isRescheduled
      isCancelled
      remark
    }
  }
`

const DELETED_EVENT_SUBSCRIPTION = gql`
  subscription {
    eventDeleted {
      id
      user {
        id
      }
    }
  }
`

const CREATED_CUSTOMER_SUBSCRIPTION = gql`
  subscription {
    customerCreated {
      id
      personal
      company
      position
      personalcontact
      companycontact
      address
    }
  }
`

const CREATED_DIRECT_CUSTOMER_SUBSCRIPTION = gql`
  subscription {
    eventCustomerCreated {
      id
      personal
      company
      position
      personalcontact
      companycontact
      address
    }
  }
`

const MainContainer = styled.div`
  ${tw``}
`

export default MainWrapper
