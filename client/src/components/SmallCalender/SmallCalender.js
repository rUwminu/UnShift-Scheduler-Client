import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import tw from 'twin.macro'
import styled from 'styled-components'
import { useSelector } from 'react-redux'

// Util
import { getMonth } from '../../utils/GlobalUtils'

// Mui icons
import { ChevronLeft, ChevronRight } from '@mui/icons-material'

const SmallCalender = ({
  isOpen,
  handleToggleCalenderOpen,
  handleGetDate,
  isStartEnd,
  isStart,
}) => {
  const [daySelected, setDaySelected] = useState()
  const [currentMonth, setCurrentMonth] = useState(getMonth())
  const [currentMonthIndex, setCurrentMonthIndex] = useState(dayjs().month())

  const calenderInfo = useSelector((state) => state.calenderInfo)
  const { monthIndex } = calenderInfo

  const handlePrevMonth = (e) => {
    e.stopPropagation()
    setCurrentMonthIndex(currentMonthIndex - 1)
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    setCurrentMonthIndex(currentMonthIndex + 1)
  }

  const handleToSelectedDayMonth = (e, day) => {
    e.stopPropagation()

    if (day !== 'All') {
      setDaySelected(day)
    } else {
      setDaySelected(null)
    }

    handleGetDate(isStart, day)
  }

  const getCurrentDay = (day) => {
    const nowDate = dayjs().format('DD-MM-YY')
    const currDate = day.format('DD-MM-YY')
    const slcDay = daySelected && daySelected.format('DD-MM-YY')

    if (currDate === nowDate) {
      return 'active'
    } else if (currDate === slcDay) {
      return 'pick-active'
    } else {
      return null
    }
  }

  // Main Calender Page Change
  useEffect(() => {
    setCurrentMonthIndex(monthIndex)
  }, [monthIndex])

  // Self Calender Page Change
  useEffect(() => {
    setCurrentMonth(getMonth(currentMonthIndex))
  }, [currentMonthIndex])

  return (
    <BoxContainer
      className={`${isOpen && 'active'}`}
      onMouseLeave={() => handleToggleCalenderOpen(isStart)}
      isBigger={currentMonth.length > 5 ? true : false}
    >
      {isOpen && (
        <>
          <div className="header-container">
            <h3>
              {dayjs(new Date(dayjs().year(), currentMonthIndex)).format(
                'MMMM YYYY'
              )}
            </h3>
            <div className="mth-btn">
              <div className="prev-btn btn" onClick={(e) => handlePrevMonth(e)}>
                <ChevronLeft className="icon" />
              </div>
              <div className="next-btn btn" onClick={(e) => handleNextMonth(e)}>
                <ChevronRight className="icon" />
              </div>
            </div>
          </div>
          <div className="calender-container">
            {currentMonth[0].map((day, i) => (
              <span key={i} className="day-title">
                {day.format('dd').charAt(0)}
              </span>
            ))}
            {currentMonth.map((row, i) => (
              <React.Fragment key={i}>
                {row.map((day, idx) => (
                  <div
                    key={idx}
                    className={`day-btn`}
                    onClick={(e) => handleToSelectedDayMonth(e, day)}
                  >
                    <span className={`${getCurrentDay(day)}`}>
                      {day.format('D')}
                    </span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
          {isStartEnd && (
            <div className="footer-container">
              <div
                className="all-btn"
                onClick={(e) => handleToSelectedDayMonth(e, 'All')}
              >
                All {isStart ? 'From Pass' : 'From Start Date'}
              </div>
            </div>
          )}
        </>
      )}
    </BoxContainer>
  )
}

const BoxContainer = styled.div`
  ${tw`
    absolute
    bottom-0
    right-0
    mb-4
    w-0
    h-0
    opacity-0
    bg-white
    rounded-md
    overflow-hidden
    pointer-events-none

    transition-all
    duration-200
    ease-in-out
  `}
  transform: translateY(calc( 100% + 1.25rem));
  box-shadow: 2px 3px 15px 3px rgba(0, 0, 0, 0.25);

  .header-container {
    ${tw`
        flex
        items-center
        justify-between
        w-full
    `}

    h3 {
      ${tw`
        pl-[0.7rem]
        text-base
        font-semibold
        text-gray-600
      `}
    }

    .mth-btn {
      ${tw`
        flex
        items-center
        justify-center
      `}

      .btn {
        ${tw`
            flex
            items-center
            justify-center
            p-1
            w-8
            h-8
            rounded-full
            cursor-pointer

            transition
            duration-200
            ease-in-out
        `}

        &:hover {
          ${tw`
            bg-gray-200
          `}
        }

        .icon {
          ${tw`
            h-full
            w-full
            text-gray-600
          `}
        }
      }
    }
  }

  .calender-container {
    ${tw`
        mt-2
        w-full
        grid
        grid-cols-7
        grid-rows-6
    `}

    .day-title {
      ${tw`
        text-xs
        text-center
        font-semibold
        text-gray-600
      `}
    }

    .day-btn {
      ${tw`
        flex
        items-center
        justify-center
        py-1
        cursor-pointer
      `}

      span {
        ${tw`
            flex
            items-center
            justify-center
            w-5
            h-5
            text-xs
            font-semibold
            text-gray-600
            rounded-full
        `}

        &:hover {
          ${tw`
            bg-gray-300
          `}
        }
      }

      span.active {
        ${tw`
            bg-blue-500
            text-gray-50
        `}
      }

      span.pick-active {
        ${tw`
            bg-blue-500
            bg-opacity-30
            text-blue-700
        `}
      }
    }
  }

  .footer-container {
    ${tw`
      px-[0.7rem]
      w-full
    `}

    .all-btn {
      ${tw`
        py-1
        text-sm
        text-gray-700
        rounded-md
        cursor-pointer

        transition-all
        duration-200
        ease-in-out
      `}

      &:hover {
        ${tw`
          pl-2
          bg-gray-200
        `}
      }
    }
  }

  &.active {
    ${tw`
      w-56
      opacity-100
      pointer-events-auto
    `}
    height: ${(props) => (props.isBigger ? '17rem' : '15rem')};
  }
`

export default SmallCalender
