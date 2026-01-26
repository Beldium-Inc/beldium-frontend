"use client";
import { useState } from "react";
import { FaqType } from "@/types";
import Image from "next/image";
import clsx from "clsx";

interface AccordionProps {
  items?: FaqType[]; // optional so it won’t crash
}

const Accordion = ({ items = [] }: AccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!items.length) {
    return null;
  }

  return (
    <div className="space-y-0">
      {items.map((data, index) => (
        <div key={index} className="overflow-hidden text-sm">
          {/* Header */}
          <button
            onClick={() => toggle(index)}
            className="flex w-full items-center font-bold justify-between p-4 text-left text-gray-800 focus:outline-none"
            aria-expanded={openIndex === index}
            aria-controls={`faq-${index}`}
          >
            <span className={`cursor-pointer`}>{data?.question}</span>
            <Image
              src={`/assets/icons/chevron-icon.svg`}
              className={clsx(
                "w-5 h-5 transition-transform duration-300",
                openIndex === index ? "rotate-270" : "rotate-90"
              )}
              width={24}
              height={24}
              alt="toggle icon"
            />
          </button>

          {/* Content */}
          <div
            id={`faq-${index}`}
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              openIndex === index ? "max-h-40 px-4" : "max-h-0 p-0"
            }`}
          >
            <p className="text-gray-600">{data?.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
