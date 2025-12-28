import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M50,95 C25.147,95 5,74.853 5,50 C5,25.147 25.147,5 50,5 C74.853,5 95,25.147 95,50 C95,74.853 74.853,95 50,95 Z"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="M25,60 C35,40 65,40 75,60"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
