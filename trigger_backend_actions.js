const fs = require('node:fs');
const path = require('node:path');

const businessId = '0b76ae1b-1ac6-49ff-ad85-4dff848b1e5b';
const backendUrl = 'http://localhost:3001';

async function performActions() {
    try {
        // 1. Upload Banner Hero
        console.log('--- 1. Iniciando Upload de Banner (section: hero) ---');
        const filePath = path.join('c:', 'Users', 'Lucas sá', 'Documents', 'agendamento_nota', 'front_end', 'src', 'public', 'professional-eyebrow-artist-at-work.jpg');
        
        if (!fs.existsSync(filePath)) {
            console.error('Arquivo não encontrado:', filePath);
            return;
        }

        // Using native fetch for node 18+
        // Let's use a simpler approach for Node: a helper function to create multipart body
        
        console.log('Utilizando Multipart manual...');
        const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
        let data = '';
        data += `--${boundary}\r\n`;
        data += 'Content-Disposition: form-data; name="section"\r\n\r\nhero\r\n';
        data += `--${boundary}\r\n`;
        data += `Content-Disposition: form-data; name="businessId"\r\n\r\n${businessId}\r\n`;
        data += `--${boundary}\r\n`;
        data += 'Content-Disposition: form-data; name="file"; filename="professional-eyebrow-artist-at-work.jpg"\r\n';
        data += 'Content-Type: image/jpeg\r\n\r\n';

        const footer = `\r\n--${boundary}--\r\n`;
        const fileBuffer = fs.readFileSync(filePath);
        const combinedBuffer = Buffer.concat([
            Buffer.from(data, 'utf-8'),
            fileBuffer,
            Buffer.from(footer, 'utf-8')
        ]);

        const uploadResponse = await fetch(`${backendUrl}/api/settings/background-image`, {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': combinedBuffer.length
            },
            body: combinedBuffer
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload falhou (${uploadResponse.status}): ${errorText}`);
        }

        const uploadData = await uploadResponse.json();
        console.log('Upload concluído com sucesso:', uploadData);
        const imageUrl = uploadData.url;

        // 2. Publish Customization (PATCH)
        console.log('\n--- 2. Iniciando Publicação (PATCH customization) ---');
        const patchData = {
            hero: {
                title: 'Beleza e Autoestima Elevadas ao Máximo',
                subtitle: 'Sobrancelhas perfeitas para o seu olhar único.',
                bgType: 'image',
                bgImage: imageUrl
            }
        };

        const patchResponse = await fetch(`${backendUrl}/api/settings/customization/${businessId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patchData)
        });

        if (!patchResponse.ok) {
            const errorText = await patchResponse.text();
            throw new Error(`Publicação falhou (${patchResponse.status}): ${errorText}`);
        }

        const publishData = await patchResponse.json();
        console.log('Publicação concluída com sucesso:', publishData);
        console.log('\n--- Todas as ações foram registradas no backend! ---');

    } catch (error) {
        console.error('Erro ao executar ações:', error.message);
    }
}

performActions();
