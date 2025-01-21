const ProgressBars = ({ value }) => (
  <div className="flex items-end">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className={`h-[16px] w-[5px] ${
          i < value ? "bg-green-600" : "bg-[#D9D9D9]"
        } rounded-2xl ${i < 11 ? "mr-1" : ""}`}
      ></div>
    ))}
  </div>
);

export default ProgressBars;
