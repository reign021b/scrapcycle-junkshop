const ProgressBars = ({ processedQuantity, goalQuantity }) => {
  // Ensure processed quantity and goal quantity are converted to numbers
  const processedNum = parseFloat(processedQuantity) || 0;
  const goalNum = parseFloat(goalQuantity) || 1;

  // Calculate the progress percentage
  const progressPercentage = (processedNum / goalNum) * 100;

  // Calculate how many bars to fill (out of 12)
  // If any progress (> 0), ensure at least 1 bar is filled
  const filledBars =
    progressPercentage > 0
      ? Math.max(1, Math.round((progressPercentage / 100) * 12))
      : 0;

  return (
    <div className="flex items-end">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`h-[16px] w-[5px] ${
            i < filledBars ? "bg-green-600" : "bg-[#D9D9D9]"
          } rounded-2xl ${i < 11 ? "mr-1" : ""}`}
        ></div>
      ))}
    </div>
  );
};

export default ProgressBars;
