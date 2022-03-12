import React, { FunctionComponent } from "react";

export const LeftTime: FunctionComponent<{
  day?: string;
  hour: string;
  minute: string;
}> = ({ day, hour, minute }) => {
  return (
    <div className="text-xl md:text-2xl flex items-center">
      {day && (
        <React.Fragment>
          {day}
          <div className="inline-block py-1 px-2 md:px-3 h-full rounded-lg bg-card mx-1">
            <h5 className="text-lg md:text-xl">D</h5>
          </div>
        </React.Fragment>
      )}

      {hour}
      <div className="inline-block py-1 px-2 md:px-3 h-full rounded-lg bg-card mx-1">
        <h5 className="text-lg md:text-xl">H</h5>
      </div>
      {minute}
      <div className="inline-block py-1 px-2 md:px-3 h-full rounded-lg bg-card mx-1">
        <h5 className="text-lg md:text-xl">M</h5>
      </div>
    </div>
  );
};
