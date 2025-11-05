import { ImageResponse } from 'next/og';
import Image from 'next/image';
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img 
          src="https://6000-firebase-studio-1762296448079.cluster-lqzyk3r5hzdcaqv6zwm7wv6pwa.cloudworkstations.dev/Logo.png" 
          width={32} 
          height={32} 
          alt="DSR HIDRAUPEÇAS Logo" 
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
