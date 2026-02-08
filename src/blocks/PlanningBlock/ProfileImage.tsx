'use client'

import Image from 'next/image'
import React from 'react'

type ProfileImageProps = {
  url: string
  name: string
  variant?: 'rounded' | 'square'
  size?: number // size in px
}

export const ProfileImage = ({
  url,
  name,
  variant = 'rounded',
  size = 24,
}: ProfileImageProps) => {
  const isRounded = variant === 'rounded'
  const borderRadiusStyle = isRounded ? '50%' : '0'
  const sizePx = `${size}px`

  return url ? (
    <div style={{ position: 'relative', width: sizePx, height: sizePx }}>
      <Image
        src={url}
        alt="Avatar image"
        style={{ borderRadius: borderRadiusStyle }}
        fill
        sizes={sizePx}
        className="object-cover"
      />
    </div>
  ) : (
    <div
      className={`uppercase bg-amber-100 flex items-center justify-center text-sm font-semibold ${
        isRounded ? 'rounded-full' : ''
      }`}
      style={{
        width: sizePx,
        height: sizePx,
      }}
    >
      {name.slice(0, 2)}
    </div>
  )
}
