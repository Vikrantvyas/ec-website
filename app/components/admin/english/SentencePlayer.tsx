"use client";

type Props = {
  data: any[];
  highlightIndex: number | null;
  setHighlightIndex: any;
};

export default function SentencePlayer({
  data,
  highlightIndex,
  setHighlightIndex,
}: Props) {

  return (
    <div className="space-y-2 p-2">

      {data.map((item: any, i: number) => {

        const text =
          item.sentence?.replace(/^\d+\.\s*/, "") || "";

        const parts = text.split(" - ");

        const hindi = parts[0] || "";

        const english = parts.slice(1).join(" - ");

        return (

          <div
            key={item.id}
            onClick={() =>
              setHighlightIndex((p: any) =>
                p === i ? null : i
              )
            }
            className={`text-xl flex cursor-pointer ${
              highlightIndex === i
                ? "bg-yellow-100"
                : ""
            }`}
          >

            <div className="w-10">
              {i + 1}.
            </div>

            <div className="w-1/2 text-lg leading-snug text-red-600">
              {hindi}
            </div>

            <div className="w-1/2 text-[18px] leading-[1.35] font-normal text-green-600">
              {english}
            </div>

          </div>

        );

      })}

    </div>
  );

}