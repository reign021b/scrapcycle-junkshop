import Navbar from "./components/navbar";

export default function Home() {
  return (
    <div>
      <main>
        <Navbar />
        <div className="w-full bg-[#F5F5F5] h-auto mx-auto pb-6">
          <div className="max-w-[1340px] mx-auto">
            <p className="text-[1.6rem] font-semibold pt-5 pl-8">
              Business Overview
            </p>
            <p className="text-sm text-[#828282] font-semibold pl-8">
              Junkshop Dashboard
            </p>
          </div>
          <div className="max-w-[1340px] mx-auto flex gap-[1.75rem] text-sm font-medium">
            {/* 1st column */}
            <div>
              {/* 1st row */}
              <div className="flex gap-[1.75rem] mt-6">
                <div className="w-[222px] h-[178px] flex items-center justify-center rounded-xl border bg-white">
                  Sales
                </div>
                <div className="w-[222px] h-[178px] flex items-center justify-center rounded-xl border bg-white">
                  Shipments
                </div>
                <div className="w-[222px] h-[178px] flex items-center justify-center rounded-xl border bg-white">
                  Cost
                </div>
                <div className="w-[222px] h-[178px] flex items-center justify-center rounded-xl border bg-white">
                  Profit
                </div>
              </div>

              {/* 2nd row */}
              <div className="flex items-center justify-center mt-6 border rounded-xl bg-white w-[972px] h-[303px]">
                Sales vs Cost vs Profit
              </div>

              <div className="flex mt-6 gap-[1.75rem]">
                <div className="w-[472px] h-[363px] flex items-center justify-center rounded-xl border bg-white">
                  Cost
                </div>
                <div className="w-[472px] h-[363px] flex items-center justify-center rounded-xl border bg-white">
                  Scraps Market Prices
                </div>
              </div>
            </div>

            {/* 2nd column */}
            <div className="w-[340px] mt-6">
              {/* 1st row */}
              <div className="border rounded-xl bg-white h-[385px] w-[340px] flex items-center justify-center">
                Top Sales Items
              </div>

              {/* 2nd row */}
              <div className="border rounded-xl bg-white h-[483px] w-[340px] flex items-center justify-center mt-6">
                Top Materials
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
