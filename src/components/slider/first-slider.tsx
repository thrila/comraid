"use client";
import { Range } from "react-range";

interface FirstSliderProps {
  min?: number;
  max?: number;
  values: number[];
  onChange: (values: number[]) => void;
}

const FirstSlider = ({ min = 0, max = 100, values, onChange }: FirstSliderProps) => {
  return (
    <div className="w-full flex flex-col gap-5 items-center">
      <div className="w-full">
        <Range
          step={10}
          min={min}
          max={max}
          values={values}
          onChange={onChange}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: "6px",
                width: "100%",
                backgroundColor: "#CA1515",
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              key={props.key}
              style={{
                ...props.style,
                height: "15px",
                width: "15px",
                borderRadius: "50%",
                backgroundColor: "#CA1515",
              }}
            />
          )}
        />
      </div>
      <div className="flex gap-5 ml-5">
        <div className="border h-[30px] min-w-[50px] px-1 border-black justify-center items-center flex">
          <span className="font-thin">${values[0]}</span>
        </div>
        <div className="border h-[30px] min-w-[50px] px-1 border-black justify-center items-center flex">
          <span className="font-thin">${values[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default FirstSlider;
