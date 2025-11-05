import { ImageResponse } from 'next/og';
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
export default function Icon() {
  const logoUrl = process.env.NODE_ENV === 'production' 
    ? 'https://dsr-hidraupecas.vercel.app/Logo.png' 
    : '/Logo.png';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        }}
      >
        <img 
          src={logoUrl} 
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
