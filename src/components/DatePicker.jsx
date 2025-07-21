import React from "react";
import Calendar from "react-multi-date-picker";

function DatePicker({ value, onChange }) {
  return (
    <div className="datepicker-wrapper">
      <Calendar
        multiple
        value={value}
        onChange={onChange}
        format="YYYY-MM-DD"
        inline
        onlyCalendar
        className="full-width-calendar"
        minDate={new Date(Date.now() - 86400000)}
      />
    </div>
  );
}

export default DatePicker;
