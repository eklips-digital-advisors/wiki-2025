import tls from 'tls';

export async function getSSLCertificate(domain: string, port = 443): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const socket = tls.connect(port, domain, { servername: domain }, () => {
            const certificate = socket.getPeerCertificate();
            socket.end();

            if (certificate && certificate.issuer && certificate.issuer.O) {
                resolve(certificate.issuer.O);
            } else {
                resolve(null);
            }
        });

        socket.setTimeout(5000, () => {
            reject('SSL request timed out');
            socket.end();
        });

        socket.on('error', (err) => {
            reject(`Error fetching certificate: ${err.message}`);
        });
    });
}
