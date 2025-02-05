import {NextResponse, NextRequest} from "next/server";

export function middleware(request: NextRequest) {
  
    const allowedIPs = [
      '46.253.204.5', //VPN
      '46.253.204.6', //VPN
      '90.190.183.173', //Madis
      '46.131.75.201', //Madis
      '130.0.201.130' //Stage
    ];
    const allowedIPsLocal = [
      '127.0.0.1',
        '::1',
        '::ffff:127.0.0.1'
    ];

    const addedIps = process.env.WIKI_DEV === 'true' ? allowedIPsLocal : allowedIPs;

    const ip = request.headers.get('x-forwarded-for') || '';
    if (!addedIps.includes(ip)) {
      return new Response('Access Denied', { status: 403 });
    }

    return NextResponse.next()

}
