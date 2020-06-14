import { Jwt } from './models/Jwt'
import { JwtPayload } from './models/JwtPayload'
import { verify, decode } from 'jsonwebtoken'

const jwksUrl = process.env.JWKS_URL
const jwksClient = require('jwks-rsa');
const client = jwksClient({ jwksUri: jwksUrl });

export async function verifyToken(socket: any, next: any): Promise<any> {
    try {
        const token = getToken(socket.handshake.headers['authorization']);
    
        const jwt: Jwt = decode(token, { complete: true }) as Jwt;

        const certificate = await getCertificate(jwt.header.kid);
        
        const user = verify(token, certificate, { algorithms: ['RS256'] }) as JwtPayload;
        socket.user = user;
        
        return next();
    } catch(e) {
        console.log(e)
        return next(new Error('Unauthorized'));
    }
}

function getCertificate(kid: string): Promise<string> {
    return new Promise((res, rej) => {
        client.getSigningKey(kid, (err: any, key: any) => {
            if (err) {
                return rej(err)
            } else {
                return res(key.getPublicKey())
            }
        })
    })
}
  
function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]

    return token
}
  