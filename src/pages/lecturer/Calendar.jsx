import { useEffect, useState } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { getDeadlineCalendar } from "../../api/lecturerApi";

const Calendar = () => {
  const lecturerId = "L001";

  const [deadlines, setDeadlines] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedDeadlines, setSelectedDeadlines] = useState([]);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCalendar();
  }, []);

  const loadCalendar = async () => {
    try {
      const data = await getDeadlineCalendar(lecturerId);

      setDeadlines(data);
    } catch (error) {
      console.error("Calendar loading error", error);
    } finally {
      setLoading(false);
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const hasDeadline = (date) => {
    return deadlines.some((item) => {
      return isSameDay(new Date(item.deadline), date);
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);

    const selected = deadlines.filter((item) => {
      return isSameDay(new Date(item.deadline), date);
    });

    setSelectedDeadlines(selected);

    if (selected.length > 0) {
      setShowModal(true);
    }
  };

  if (loading) {
    return <div className="p-6 text-xl">Loading Calendar...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Deadline Calendar</h1>

      <div className="bg-white rounded-xl shadow-lg p-5">
        <ReactCalendar
          value={selectedDate}
          onClickDay={handleDateClick}
          tileContent={({ date, view }) => {
            if (view === "month" && hasDeadline(date)) {
              return (
                <div className="flex justify-center mt-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                </div>
              );
            }

            return null;
          }}
        />
      </div>

      {showModal && (
        <div
          className="
                        fixed 
                        inset-0 
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        z-50
                    "
        >
          <div
            className="
                            bg-white
                            w-[500px]
                            rounded-xl
                            shadow-xl
                            p-6
                        "
          >
            <div
              className="
                                flex
                                justify-between
                                items-center
                                mb-5
                            "
            >
              <h2
                className="
                                    text-2xl
                                    font-bold
                                "
              >
                Deadline Details
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="
                                        text-red-600
                                        text-2xl
                                    "
              >
                ✕
              </button>
            </div>

            <p className="mb-4 text-gray-600">{selectedDate.toDateString()}</p>

            {selectedDeadlines.map((item) => (
              <div
                key={item.packetId}
                className="
                                            border
                                            rounded-lg
                                            p-4
                                            mb-4
                                            bg-gray-50
                                        "
              >
                <p>
                  <b>Packet ID:</b> {item.packetId}
                </p>

                <p>
                  <b>Course Code:</b> {item.courseCode}
                </p>

                <p>
                  <b>Course Name:</b> {item.courseName}
                </p>

                <p>
                  <b>Deadline:</b> {item.deadline}
                </p>

                <p>
                  <b>Status:</b> {item.status}
                </p>
              </div>
            ))}

            <div className="text-right">
              <button
                onClick={() => setShowModal(false)}
                className="
                                        bg-blue-600
                                        hover:bg-blue-700
                                        text-white
                                        px-5
                                        py-2
                                        rounded-lg
                                    "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
