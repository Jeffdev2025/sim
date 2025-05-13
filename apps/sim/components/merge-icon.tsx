import React from 'react'

export function MergeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Flèches convergentes représentant la fusion */}
      <path d="M8 3L4 7L8 11" />
      <path d="M16 3L20 7L16 11" />
      <line x1="4" y1="7" x2="20" y2="7" />
      
      {/* Flèche unique sortante */}
      <line x1="12" y1="11" x2="12" y2="21" />
      <path d="M8 17L12 21L16 17" />
    </svg>
  )
}
