import { BsFillPlusSquareFill } from "react-icons/bs";
import { LiaEqualsSolid, LiaGreaterThanSolid } from "react-icons/lia";
import ItemCard from "./ItemCard";

const TypeSection = ({
  type,
  isCollapsed,
  onToggle,
  onAddItem,
  items,
  onItemClick,
  junkshopId,
  processedItems,
}) => (
  <div className="mb-2">
    <div
      className={`flex bg-green-50 justify-between ${
        !isCollapsed ? "border-t-2 border-b-2 border-gray-200" : ""
      }`}
    >
      <div
        className="px-6 py-3 flex items-center cursor-pointer"
        onClick={onToggle}
      >
        {isCollapsed ? <LiaGreaterThanSolid /> : <LiaEqualsSolid />}
        &nbsp; &nbsp;
        <p className="font-medium text-[1rem]">
          {type.name.replace(/\b\w/g, (char) => char.toUpperCase())}
        </p>
      </div>
      <div
        className="text-[1.7rem] text-green-600 flex items-center px-5 cursor-pointer"
        onClick={() => onAddItem(type.name)}
      >
        <BsFillPlusSquareFill />
      </div>
    </div>

    <div
      style={{
        maxHeight: isCollapsed ? "0" : "1000px",
        overflow: "hidden",
        transition: "max-height 0.3s ease-in-out",
      }}
    >
      {!isCollapsed &&
        (items?.length > 0 ? (
          items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onItemClick={onItemClick}
              junkshopId={junkshopId}
              processedItems={processedItems}
            />
          ))
        ) : (
          <div className="pl-6 pr-3 py-4 text-gray-500 italic text-center">
            No items in this category
          </div>
        ))}
    </div>
  </div>
);

export default TypeSection;
