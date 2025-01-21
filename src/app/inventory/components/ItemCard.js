import Image from "next/image";
import { SlOptionsVertical } from "react-icons/sl";
import ProgressBars from "./ProgressBars";

const ItemCard = ({ item, onItemClick, junkshopId, processedItems }) => {
  const getProcessedQuantity = (itemName, branch) => {
    const filteredItems = processedItems.filter(
      (p) =>
        p.item.toLowerCase() === itemName.toLowerCase() &&
        p.branch === branch &&
        p.junkshop_id === junkshopId
    );

    const total = filteredItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      return sum + quantity;
    }, 0);

    return total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div
      className="pl-6 pr-3 py-2 mt-2 flex justify-between hover:border-gray-500 cursor-pointer"
      onClick={() => onItemClick(item)}
    >
      <div className="flex">
        <div>
          <Image src={item.image} width={50} height={50} alt={item.item} />
        </div>
        <div className="ml-3 items-center">
          <p className="font-semibold">
            {item.item.replace(/\b\w/g, (char) => char.toUpperCase())}
          </p>
          <p className="pt-1 font-[480] text-sm text-gray-500">
            ₱ {item.price || 0} / kg
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <div>
          <div className="flex items-center text-xs mb-2 justify-end">
            <p>
              {getProcessedQuantity(item.item, item.branch)} kg /{" "}
              {Number(item.goal_quantity).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              kg
            </p>
          </div>
          <ProgressBars value={0} />
        </div>
        <div className="ml-2 text-gray-500 font-extralight">
          <SlOptionsVertical />
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
