import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL('/', request.url)
  const response = NextResponse.redirect(url, { status: 302 })

  response.cookies.set('nextauth.token', '', {
    maxAge: 0,
    path: '/',
    expires: new Date(0),
  })

  return response
}
